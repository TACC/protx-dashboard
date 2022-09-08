import psycopg2
import geopandas
import csv
import shapely
from datetime import datetime
from sqlalchemy import create_engine
from flask import abort, Response

from protx.utils.db import SQLALCHEMY_RESOURCES_DATABASE_URL


def get_resources_and_display(naics_codes=None):
    """
    Get resources and related metadata

    if naics_codes, then limit the resources returned to those
    that have a NAICS_CODE in naics_codes
    """
    engine = create_engine(SQLALCHEMY_RESOURCES_DATABASE_URL, connect_args={'check_same_thread': False})
    with engine.connect() as connection:
        resource_query = "SELECT * FROM business_locations"
        if naics_codes:
            resource_query += " r WHERE r.NAICS_CODE IN ({})".format(
                ','.join(['"{}"'.format(code) for code in naics_codes]))
        resources = connection.execute(resource_query)
        resources_result = []
        for r in resources:
            resources_result.append(dict(r))
        meta = connection.execute("SELECT * FROM business_menu")
        display_result = []
        for m in meta:
            display_result.append(dict(m))
    return resources_result, display_result


class Echo:
    """An object that implements just the write method of the file-like
    interface."""
    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value


def download_resources(naics_codes, area, geoid):
    """Get resources csv"""
    download_fields = ["NAME", "STREET", "CITY", "STATE", "POSTAL_CODE", "PHONE", "WEBSITE", "LATITUDE", "LONGITUDE", "NAICS_CODE"]
    supported_areas = {"county": {"table": "texas_counties", "geo_identifier": "geo_id", "name": "name"},
                       "tract": {"table": "census_tracts_2019", "geo_identifier": "geoid", "name": "name"},
                       "dfps_region": {"table": "dfps_regions", "geo_identifier": "sheet1__re", "name": "sheet1__re"}}

    if area not in supported_areas:
        abort(500, f"Downloading {area} is not supported")

    connection = psycopg2.connect(database="postgres", user="postgres", password="postgres", host="protx_geospatial")

    area_table = supported_areas[area]["table"]
    area_id_key = supported_areas[area]["geo_identifier"]
    name_key = supported_areas[area]["name"]
    query = f"select * from {area_table} where {area_table}.{area_id_key}='{geoid}'"
    area_dataframe = geopandas.GeoDataFrame.from_postgis(query, connection, geom_col='geom')
    area_name = area_dataframe.iloc[0][name_key]
    area_name = area_name.replace(".", "_")  # tracts have the form like '2107.08'

    connection.close()

    def generate_csv_rows():
        # header row
        yield download_fields + ["NAICS_DESCRIPTION"]

        resources_result, display_result = get_resources_and_display(naics_codes=naics_codes)

        naics_to_description = {d["NAICS_CODE"]: d["DESCRIPTION"] for d in display_result}

        for r in resources_result:
            long = r["LONGITUDE"]
            lat = r["LATITUDE"]
            if lat and long:  # some resources are missing position
                point = shapely.geometry.Point(long, lat)
                if area_dataframe.contains(point).any():
                    row = [r[key] for key in download_fields] + [naics_to_description[r["NAICS_CODE"]]]
                    yield row

    pseudo_buffer = Echo()
    writer = csv.writer(pseudo_buffer)
    response = Response(
        (writer.writerow(row) for row in generate_csv_rows()),
        content_type="text/csv",
    )

    # datetime object containing current date and time
    timestamp = datetime.now().strftime("%d_%m_%Y_%H_%M")
    filename = f"{area_name}_{area}_resources_{timestamp}.csv"
    response.headers['Content-Disposition'] = 'attachment; filename="{}"'.format(filename)

    return response
