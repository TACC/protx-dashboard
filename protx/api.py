from flask_restx import Namespace, Resource, fields
from flask import request
from sqlalchemy import create_engine
from sqlalchemy.orm.exc import NoResultFound
from flask import make_response
from werkzeug.exceptions import BadRequest


from protx.log import logger
from protx.decorators import onboarded_user_required, memoize_db_results, create_compressed_json
from protx.utils.db import (cooks_db, analytics_db, resources_db, create_dict, SQLALCHEMY_DATABASE_URL, SQLALCHEMY_RESOURCES_ANALYTICS_URL,
                            DEMOGRAPHICS_JSON_STRUCTURE_KEYS, DEMOGRAPHICS_QUERY, DEMOGRAPHICS_MIN_MAX_QUERY,
                            MALTREATMENT_JSON_STRUCTURE_KEYS, MALTREATMENT_QUERY, MALTREATMENT_MIN_MAX_QUERY)
from protx.utils import demographics, maltreatment, resources, analytics


api = Namespace("api", description="Data related operations", decorators=[onboarded_user_required])


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
        logger.info("getting demographics")
        compressed_content = get_demographics_cached_and_compressed()
        response = make_response(compressed_content)
        response.headers['Content-length'] = len(compressed_content)
        response.headers['Content-Encoding'] = 'gzip'
        return response


@onboarded_user_required
@api.route("/download/<area>/<geoid>/")
class DownloadResources(Resource):
    @api.doc("get_resources")
    def get(self, area, geoid):
        selected_categories = request.args.getlist("selectedCategory")
        return resources.download_resources(selected_categories=selected_categories, area=area, geoid=geoid)


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


@api.route("/demographics-community-characteristics-chart/<area>/<geoid>/")
class CommunityCharacteristicsDistributionChart(Resource):
    @api.doc("get_community_characteristics_chart")
    def get(self, area, geoid):
        """Get race/age pie charts for selected areas

        For example, `/protx/api/demographics-community-characteristics-chart/county/48257`

        """
        logger.info(f"Getting race and age distribution charts for area: {area} and selected geoid:{geoid}")
        charts = demographics.get_age_race_pie_charts(area=area, geoid=geoid)
        return {"result": charts}


maltreatment_plot = api.model('MaltreatmentPlot', {
    "area": fields.String(),
    "geoid": fields.String(),
    "variables": fields.String(),
    "unit": fields.String()
})


@api.route("/maltreatment-plot-distribution/")
class MaltreatmentPlotData(Resource):
    @api.expect(maltreatment_plot)
    @api.doc("get_maltreatment_plot_data")
    def patch(self):
        """Get maltreatment distribution data for plotting"""
        area = api.payload["area"]
        geoid = api.payload["geoid"]
        variables = api.payload["variables"]
        unit = api.payload["unit"]
        logger.info("Getting maltreatment plot data for {} {} {} on the variables: {}".format(area,
                                                                                              unit,
                                                                                              geoid,
                                                                                              variables))
        result = maltreatment.maltreatment_plot_figure(area=area, geoid=geoid, variables=variables, unit=unit)
        return {"result": result}


@api.route("/maltreatment-age-breakdown-chart/<area>/<geoid>/")
class MaltreatmentAgeDistributionChart(Resource):
    @api.doc("get_maltreatment_age_breakdown_chart")
    def get(self, area, geoid):

        logger.info(f"Getting maltreatment breakdown by children age chart for area: {area} and selected geoid:{geoid}")
        charts = maltreatment.get_child_mal_by_age_charts(area=area, geoid=geoid)
        return {"result": charts}


@api.route("/analytics/<area>/")
class Analytics(Resource):
    @api.doc("get_analytics_data")
    def get(self, area):
        """Get analytic information for all of texas

        For example, `/protx/api/analytics/county/`

        """
        logger.info(f"Getting analytics data for {area}")
        engine = create_engine(SQLALCHEMY_RESOURCES_ANALYTICS_URL, connect_args={'check_same_thread': False})
        with engine.connect() as connection:
            result = connection.execute(f"SELECT * FROM predictions p WHERE p.GEOTYPE='{area}'")
            data = {}
            for row in result:
                data[row["GEOID"]] = dict(row)
                for key in ["GEOTYPE", "GEOID"]:
                    del data[row["GEOID"]][key]
            return {"result": data}


@api.route("/analytics/<area>/<geoid>/")
class AnalyticsSubset(Resource):
    @api.doc("get_analytics_data_for_a_specific_area")
    def get(self, area, geoid):
        """Get analytic information for a specific area (i.e. county) of texas

        For example, `/protx/api/analytics/county/48257/`

        """
        logger.info(f"Getting analytics data for {area} {geoid}")
        engine = create_engine(SQLALCHEMY_RESOURCES_ANALYTICS_URL, connect_args={'check_same_thread': False})
        with engine.connect() as connection:
            try:
                result = connection.execute(f"SELECT * FROM predictions p WHERE p.GEOID={geoid} AND p.GEOTYPE='{area}'").one()
                return {"result": dict(result)}
            except NoResultFound:
                return {"result": {"GEOID": int(geoid)}}


@api.route("/analytics-chart/<area>/<analytics_type>")
class AnalyticsChart(Resource):
    @api.doc("get_analytics_chart")
    def get(self, area, analytics_type):
        """Get analytic chart for the state of texas

        For example, `/protx/api/analytics-chart/county/risk/1234`

        If geoid query parameter is provided, then try to show the value of that area
        on the chart.

        """
        selected_geoid = request.args.get("geoid")

        logger.info(f"Getting analytics chart for area: {area} and analytics_type: {analytics_type}  selected geoid:{selected_geoid}")

        data = analytics.read_sqlite(analytics_db)
        if analytics_type == "risk":
            raise BadRequest("Displaying risk chart is not supported yet")
        elif analytics_type == "pred_per_100k":
            result = analytics.get_distribution_prediction_plot(data, geoid=selected_geoid)
        else:
            raise BadRequest("Unsupported analytics_type")
        return {"result": result}


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


@api.route("/resources")
class Resources(Resource):
    @api.doc("get_resources")
    def get(self):
        compressed_content = get_resources_cached_and_compressed()
        response = make_response(compressed_content)
        response.headers['Content-length'] = len(compressed_content)
        response.headers['Content-Encoding'] = 'gzip'
        return response


@memoize_db_results(db_file=cooks_db)
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


def get_demographics():
    """Get demographics data

    """
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={'check_same_thread': False})
    with engine.connect() as connection:
        result = connection.execute(DEMOGRAPHICS_QUERY)
        data = create_dict(result, level_keys=DEMOGRAPHICS_JSON_STRUCTURE_KEYS)
        result = connection.execute(DEMOGRAPHICS_MIN_MAX_QUERY)
        meta = create_dict(result, level_keys=DEMOGRAPHICS_JSON_STRUCTURE_KEYS[:-1])
        return data, meta


@memoize_db_results(db_file=cooks_db)
@create_compressed_json()
def get_demographics_cached_and_compressed():
    """Get demographics data as compressed json string

    """
    data, meta = get_demographics()
    return {"data": data, "meta": meta}


@memoize_db_results(db_file=resources_db)
@create_compressed_json()
def get_resources_cached_and_compressed():
    """Get resources data as compressed json string
    """
    resources_result = resources.get_resources()
    return {"resources": resources_result}
