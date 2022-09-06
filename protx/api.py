from flask_restx import Namespace, Resource, fields
from flask import request
from sqlalchemy import create_engine

from protx.log import logger
from protx.decorators import onboarded_user_required
from protx.utils.db import (resources_db, create_dict, SQLALCHEMY_DATABASE_URL,
                            DEMOGRAPHICS_JSON_STRUCTURE_KEYS, DEMOGRAPHICS_QUERY, DEMOGRAPHICS_MIN_MAX_QUERY,
                            MALTREATMENT_JSON_STRUCTURE_KEYS, MALTREATMENT_QUERY, MALTREATMENT_MIN_MAX_QUERY)
from protx.utils import demographics, maltreatment, resources
from protx.decorators import memoize_db_results


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
        return get_demographics_cached()


@onboarded_user_required
@api.route("/download/<area>/<geoid>/")
class DownloadResources(Resource):
    @api.doc("get_resources")
    def get(self, area, geoid):
        naics_codes = request.args.getlist("naicsCode")
        return resources.download_resources(naics_codes=naics_codes, area=area, geoid=geoid)


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
    resources_result, display_result = resources.get_resources_and_display()
    return {"resources": resources_result, "display": display_result}
