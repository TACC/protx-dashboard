from flask_restx import Namespace, Resource, fields
from flask import abort
from sqlalchemy import create_engine
import psycopg2
import geopandas
import csv
import shapely
import datetime
from protx.log import logging
from protx.decorators import onboarded_user_required
from protx.utils.db import (resources_db, create_dict, SQLALCHEMY_DATABASE_URL, SQLALCHEMY_RESOURCES_DATABASE_URL,
                            DEMOGRAPHICS_JSON_STRUCTURE_KEYS, DEMOGRAPHICS_QUERY, DEMOGRAPHICS_MIN_MAX_QUERY,
                            MALTREATMENT_JSON_STRUCTURE_KEYS, MALTREATMENT_QUERY, MALTREATMENT_MIN_MAX_QUERY)
from protx.utils import demographics, maltreatment
from protx.decorators import memoize_db_results


api = Namespace("api", description="Data related operations", decorators=[onboarded_user_required])

logger = logging.getLogger(__name__)


@onboarded_user_required
@api.route("/maltreatment")
class Maltreatment(Resource):
    @api.doc("get_maltreatment")
    def get(self):
        return get_maltreatment_cached()


@onboarded_user_required
@api.route("/demographics")
class Demographics(Resource):
    @api.doc("get_demographics")
    def get(self):
        return get_demographics_cached()


@onboarded_user_required
@api.route("/download/<area>/<geoid>/")
class DownloadResources(Resource):
    @api.doc("get_resources")
    def get(self):
        # TODO  download_resources needs to be updated for streaming in flask
        return {}


@onboarded_user_required
@api.route("/demographics-plot-distribution/<area>/<geoid>/<variable>/<unit>/")
class DemographicsDistributionPlotData(Resource):
    @api.doc("get_demographics_distribution_plot_data")
    def get(self, area, geoid, variable, unit):
        """Get demographics distribution data for plotting

        For example, `/protx/api/demographics-plot-distribution/county/48257/CROWD/percent/`

        """
        logger.info("Getting demographic plot data for {} {} {} {}".format(area, geoid, variable, unit))
        result = demographics.demographics_simple_lineplot_figure(area=area, geoid=geoid, variable=variable, unit=unit)
        return {"result": result}


maltreatment_plot = api.model('MaltreatmentPlot', {
    "area": fields.String(),
    "selectedArea": fields.String(),
    "geoid": fields.String(),
    "variables": fields.String(),
    "unit": fields.String()
})


@onboarded_user_required
@api.route("/maltreatment-plot-distribution/")
class MaltreatmentPlotData(Resource):
    @api.expect(maltreatment_plot)
    @api.doc("get_maltreatment_plot_data")
    def patch(self):
        """Get maltreatment distribution data for plotting"""
        area = api.payload["area"]
        selectedArea = api.payload["selectedArea"]
        geoid = api.payload["geoid"]
        variables = api.payload["variables"]
        unit = api.payload["unit"]
        logger.info("Getting maltreatment plot data for {} {} {} {} on the variables: {}".format(area,
                                                                                                 selectedArea,
                                                                                                 unit,
                                                                                                 geoid,
                                                                                                 variables))
        result = maltreatment.maltreatment_plot_figure(area=area, selectedArea=selectedArea,
                                                       geoid=geoid, variables=variables, unit=unit)
        return {"result": result}


@onboarded_user_required
@api.route("/display")
class Display(Resource):
    @api.doc("get_display")
    def get(self):
        """Get display information data"""
        engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={'check_same_thread': False})
        with engine.connect() as connection:
            display_data = connection.execute("SELECT * FROM display_data")
            result = []
            for variable_info in display_data:
                var = dict(variable_info)
                # Interpret some variables used to control dropdown population https://jira.tacc.utexas.edu/browse/COOKS-148
                for boolean_var_key in ["DISPLAY_DEMOGRAPHIC_COUNT", "DISPLAY_DEMOGRAPHIC_RATE",
                                        "DISPLAY_MALTREATMENT_COUNT", "DISPLAY_MALTREATMENT_RATE"]:
                    current_value = var[boolean_var_key]
                    var[boolean_var_key] = True if (current_value == 1 or current_value == "1") else False
                result.append(var)
            return {"variables": result}


@onboarded_user_required
@api.route("/resources")
class Resources(Resource):
    @api.doc("get_resources")
    def get(self):
        return get_resources_cached()


@memoize_db_results(db_file=maltreatment.db_name)
def get_maltreatment_cached():
    """Get maltreatment data

    """
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={'check_same_thread': False})
    with engine.connect() as connection:
        result = connection.execute(MALTREATMENT_QUERY)
        data = create_dict(result, level_keys=MALTREATMENT_JSON_STRUCTURE_KEYS)
        result = connection.execute(MALTREATMENT_MIN_MAX_QUERY)
        meta = create_dict(result, level_keys=MALTREATMENT_JSON_STRUCTURE_KEYS[:-1])
        return {"data": data, "meta": meta}


@memoize_db_results(db_file=demographics.db_name)
def get_demographics_cached():
    """Get demographics data

    """
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={'check_same_thread': False})
    with engine.connect() as connection:
        result = connection.execute(DEMOGRAPHICS_QUERY)
        data = create_dict(result, level_keys=DEMOGRAPHICS_JSON_STRUCTURE_KEYS)
        result = connection.execute(DEMOGRAPHICS_MIN_MAX_QUERY)
        meta = create_dict(result, level_keys=DEMOGRAPHICS_JSON_STRUCTURE_KEYS[:-1])
        return {"data": data, "meta": meta}


@memoize_db_results(db_file=resources_db)
def get_resources_cached():
    resources_result, display_result = get_resources_and_display()
    return {"resources": resources_result, "display": display_result}


@memoize_db_results(db_file=resources_db)
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


_DOWNLOAD_FIELDS = ["NAME", "CITY", "STATE", "POSTAL_CODE", "PHONE", "WEBSITE", "LATITUDE", "LONGITUDE", "NAICS_CODE"]


class Echo:
    """An object that implements just the write method of the file-like
    interface."""
    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value


@onboarded_user_required
def download_resources(request, area, geoid):
    """Get display information data"""
    selected_naics_codes = request.GET.getlist("naicsCode")

    if area != "county":
        # currently assuming county and query is hardcoded for "texas_counties"
        abort(500, "Only downloading counties is supported")

    connection = psycopg2.connect(database="postgres", user="postgres", password="postgres", host="protx_geospatial")
    query = "select * from texas_counties where texas_counties.geo_id='{}'".format(geoid)
    county_dataframe = geopandas.GeoDataFrame.from_postgis(query, connection, geom_col='geom')
    county_name = county_dataframe.iloc[0]["name"]
    connection.close()

    def generate_csv_rows():
        # header row
        yield _DOWNLOAD_FIELDS + ["NAICS_DESCRIPTION"]

        resources_result, display_result = get_resources_and_display(naics_codes=selected_naics_codes)

        naics_to_description = {d["NAICS_CODE"]: d["DESCRIPTION"] for d in display_result}

        for r in resources_result:
            long = r["LONGITUDE"]
            lat = r["LATITUDE"]
            if lat and long:  # some resources are missing position
                point = shapely.geometry.Point(long, lat)
                if county_dataframe.contains(point).any():
                    row = [r[key] for key in _DOWNLOAD_FIELDS] + [naics_to_description[r["NAICS_CODE"]]]
                    yield row

    pseudo_buffer = Echo()
    writer = csv.writer(pseudo_buffer)
    response = StreamingHttpResponse(
        (writer.writerow(row) for row in generate_csv_rows()),
        content_type="text/csv",
    )

    # datetime object containing current date and time
    timestamp = datetime.now().strftime("%d_%m_%Y_%H_%M")
    filename = f"{county_name}_{area}_resources_{timestamp}.csv"
    response['Content-Disposition'] = 'attachment; filename="{}"'.format(filename)
    return response
