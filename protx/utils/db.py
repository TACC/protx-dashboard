from protx.utils import demographics
from protx.log import logger
from werkzeug.exceptions import HTTPException


# TODO: single engine for django instance.


MALTREATMENT_QUERY = "SELECT * FROM maltreatment"

MALTREATMENT_MIN_MAX_QUERY = '''
SELECT
    m.GEOTYPE,
    m.UNITS,
    m.YEAR,
    m.MALTREATMENT_NAME,
    MIN(m.value) as MIN,
    MAX(m.value) as MAX
FROM maltreatment m
WHERE m.GEOTYPE='county'
GROUP BY
    m.GEOTYPE,
    m.UNITS,
    m.YEAR,
    m.MALTREATMENT_NAME;
'''

DEMOGRAPHICS_QUERY = '''
SELECT d.GEOID, d.GEOTYPE, d.YEAR, d.DEMOGRAPHICS_NAME, d.VALUE, d.UNITS
FROM demographics d
LEFT JOIN display_data i ON i.name = d.demographics_name
WHERE (i.DISPLAY_DEMOGRAPHIC_COUNT = 1 OR i.DISPLAY_DEMOGRAPHIC_RATE = 1)
      AND (d.GEOTYPE='county' OR d.GEOTYPE='tract' OR d.GEOTYPE='dfps_region')
'''

DEMOGRAPHICS_MIN_MAX_QUERY = '''
SELECT
    d.GEOTYPE,
    d.UNITS,
    d.YEAR,
    d.DEMOGRAPHICS_NAME,
    MIN(d.value) AS MIN,
    MAX(d.value) AS MAX
FROM demographics d
LEFT JOIN display_data i ON i.name = d.demographics_name
WHERE (i.DISPLAY_DEMOGRAPHIC_COUNT = 1 OR i.DISPLAY_DEMOGRAPHIC_RATE = 1)
      AND (d.GEOTYPE='county' OR d.GEOTYPE='tract' OR d.GEOTYPE='dfps_region')
GROUP BY
    d.GEOTYPE,
    d.UNITS,
    d.YEAR,
    d.DEMOGRAPHICS_NAME;
'''

resources_db = '/protx-data/resources.db'

SQLALCHEMY_DATABASE_URL = 'sqlite:///{}'.format(demographics.db_name)
SQLALCHEMY_RESOURCES_DATABASE_URL = 'sqlite:///{}'.format(resources_db)

MALTREATMENT_JSON_STRUCTURE_KEYS = ["GEOTYPE", "YEAR", "MALTREATMENT_NAME", "GEOID"]
DEMOGRAPHICS_JSON_STRUCTURE_KEYS = ["GEOTYPE", "YEAR", "DEMOGRAPHICS_NAME", "GEOID"]

import time

def timer_func(func):
    # This function shows the execution time of
    # the function object passed
    def wrap_func(*args, **kwargs):
        t1 = time.time()
        result = func(*args, **kwargs)
        t2 = time.time()
        print(f'Function {func.__name__!r} executed in {t2-t1}')
        logger.info(f'Function {func.__name__!r} executed in {t2-t1}')
        return result
    return wrap_func


def create_dict_from_min_max(data, level_keys):
    def value_getter(row):
        if "MAX" in row:
            value_key = row["UNITS"]
            if row["MIN"] is None or row["MAX"] is None:
                # logger.debug("max/min problem with this row: {}".format(row))
                return None, None
            value = {key.lower(): int(row[key]) if value_key == "count" else row[key] for key in ["MAX", "MIN"]}
        else:
            raise HTTPException("Problem with this row: {}".format(row))
        return value, value_key
    return _create_dict(data, level_keys, value_getter)


def create_dict_from_value(data, level_keys):
    def value_getter(row):
        if "VALUE" in row:
            value_key = row["UNITS"]
            value = row["VALUE"]

            if value is None:
                return None, None

            # workaround as count values are stored as floats
            if value_key == "count":
                value = int(value)
        else:
            raise HTTPException("Problem with this row: {}".format(row))
        return value, value_key
    return _create_dict(data, level_keys, value_getter)



@timer_func
def _create_dict(data, level_keys, value_getter):
    """Create n-level hierarchical/nested dictionaries from search result

    Parameters
    ----------
    data : iterable
        data
    level_keys : str iterable
        List of column keys for each level of nested dictionaries.
    value_getter : function to get value from row

    Returns
    -------
    dict

    """
    result = {}
    for i, row in enumerate(data):
        current_level = result
        # iterate over level keys and create nested dictionary
        for k in level_keys[:-1]:
            if row[k] not in current_level:
                current_level[row[k]] = {}
            current_level = current_level[row[k]]

        # the most nested dictionary is either the value for a unit or the min/max of that unit
        value, value_key = value_getter(row)
        if value is None:
            continue

        values = {value_key: value}

        # set the values at last key
        last_key = str(row[level_keys[-1]])
        if last_key in current_level:
            current_level[last_key].update(values)
        else:
            current_level[last_key] = values
    return result
