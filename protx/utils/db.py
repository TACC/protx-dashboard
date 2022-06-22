import logging
from protx.utils import demographics
from werkzeug.exceptions import HTTPException


logger = logging.getLogger(__name__)

### TODO: single engine for django instance.

cooks_db = '/protx-data/cooks.db'
resources_db = '/protx-data/resources.db'

# Support county and tract for https://jira.tacc.utexas.edu/browse/COOKS-135
DEMOGRAPHICS_QUERY = "SELECT * FROM demographics d WHERE d.GEOTYPE='county'"

DEMOGRAPHICS_MIN_MAX_QUERY = '''
SELECT
    d.GEOTYPE,
    d.UNITS,
    d.YEAR,
    d.DEMOGRAPHICS_NAME,
    MIN(d.value) AS MIN,
    MAX(d.value) AS MAX
FROM demographics d
WHERE d.GEOTYPE='county'
GROUP BY
    d.GEOTYPE,
    d.UNITS,
    d.YEAR,
    d.DEMOGRAPHICS_NAME;
'''

DEMOGRAPHICS_JSON_STRUCTURE_KEYS = ["GEOTYPE", "YEAR", "DEMOGRAPHICS_NAME", "GEOID"]

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

MALTREATMENT_JSON_STRUCTURE_KEYS = ["GEOTYPE", "YEAR", "MALTREATMENT_NAME", "GEOID"]

# SQLALCHEMY_DATABASE_URL = 'sqlite:///{}'.format(demographics.db_name)
SQLALCHEMY_DATABASE_URL = 'sqlite:///{}'.format(cooks_db)

SQLALCHEMY_RESOURCES_DATABASE_URL = 'sqlite:///{}'.format(resources_db)


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
                logger.error("max/min problem with this row: {}".format(row))
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
