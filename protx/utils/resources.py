import psycopg2
import geopandas
import csv
import shapely
from datetime import datetime
from sqlalchemy import create_engine
from flask import abort, Response

from protx.utils.db import SQLALCHEMY_RESOURCES_DATABASE_URL


def get_resources(selected_categories=None):
    """
    Get resources from database, filtering out null latitude and longitude values.

    A result set containing the following fields:
    - All fields from the 'business_locations' table.
    - 'DETAILED_DESCRIPTION' field from the 'detailed_menu' table (i.e our main category)
    - 'MAIN_DESCRIPTION' field from the 'detailed_menu' table (i.e. our secondary category)
    -

    Args:
        selected_categories: if provided, then limit to resources with MAIN_DESCRIPTION matching selected_categories
    """

    engine = create_engine(SQLALCHEMY_RESOURCES_DATABASE_URL, connect_args={'check_same_thread': False})
    with engine.connect() as connection:
        resource_query = "SELECT bl.*, dm.DETAILED_DESCRIPTION, dm.MAIN_DESCRIPTION" \
                         " FROM business_locations bl" \
                         " JOIN detailed_menu dm ON bl.FULL_NAICS_CODE = dm.FULL_NAICS_CODE " \
                         "WHERE bl.LATITUDE IS NOT NULL AND bl.LONGITUDE IS NOT NULL "
        if selected_categories:
            resource_query += "AND dm.MAIN_DESCRIPTION IN ({})".format(
                ','.join(['"{}"'.format(code) for code in selected_categories]))
        resources = connection.execute(resource_query)
        resources_result = []
        for r in resources:
            resources_result.append(dict(r))
    return resources_result


class Echo:
    """An object that implements just the write method of the file-like
    interface."""
    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value


def download_resources(selected_categories, area, geoid):
    """Get resources csv"""
    download_fields = ["NAME", "STREET", "CITY", "STATE", "POSTAL_CODE", "PHONE", "WEBSITE", "NAICS_CODE",
                       "FULL_NAICS_CODE", "DETAILED_DESCRIPTION", "MAIN_DESCRIPTION"]
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
        yield download_fields

        resources_result = get_resources(selected_categories=selected_categories)

        for r in resources_result:
            long = r["LONGITUDE"]
            lat = r["LATITUDE"]
            if lat and long:  # some resources are missing position
                point = shapely.geometry.Point(long, lat)
                if area_dataframe.contains(point).any():
                    row = [r[key] for key in download_fields]
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
