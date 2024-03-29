from protx.log import logger
from werkzeug.exceptions import HTTPException
import os


cooks_db = f'/protx-data/{os.getenv("PROTX_COOKS_DATABASE")}'
analytics_db = f'/protx-data/{os.getenv("PROTX_ANALYTICS_DATABASE")}'
resources_db = f'/protx-data/{os.getenv("PROTX_RESOURCES_DATABASE")}'


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

SQLALCHEMY_DATABASE_URL = 'sqlite:///{}'.format(cooks_db)
SQLALCHEMY_RESOURCES_DATABASE_URL = 'sqlite:///{}'.format(resources_db)
SQLALCHEMY_RESOURCES_ANALYTICS_URL = 'sqlite:///{}'.format(analytics_db)

MALTREATMENT_JSON_STRUCTURE_KEYS = ["GEOTYPE", "YEAR", "MALTREATMENT_NAME", "GEOID"]
DEMOGRAPHICS_JSON_STRUCTURE_KEYS = ["GEOTYPE", "YEAR", "DEMOGRAPHICS_NAME", "GEOID"]


def create_dict(data, level_keys):
    """Create n-level hierarchical/nested dictionaries from search result

    Parameters
    ----------
    data : iterable
        data
    level_keys : str iterable
        List of column keys for each level of nested dictionaries.

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
        if "MAX" in row:
            value_key = row["UNITS"]
            if row["MIN"] is None or row["MAX"] is None:
                logger.debug("max/min problem with this row: {}".format(row))
                continue
            value = {key.lower(): int(row[key]) if value_key == "count" else row[key] for key in ["MAX", "MIN"]}
        elif "VALUE" in row:
            value_key = row["UNITS"]
            value = row["VALUE"]

            if value is None:
                continue

            # workaround as count values are stored as floats
            if value_key == "count":
                value = int(value)
        else:
            raise HTTPException("Problem with this row: {}".format(row))

        values = {value_key: value}

        # set the values at last key
        last_key = str(row[level_keys[-1]])
        if last_key in current_level:
            current_level[last_key].update(values)
        else:
            current_level[last_key] = values
    return result
