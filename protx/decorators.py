from functools import wraps
from werkzeug.exceptions import Forbidden
from diskcache import Cache
import os
import logging
from flask import request, redirect
import requests

logger = logging.getLogger(__name__)

cache = Cache("database_cache")


def onboarded_user_required(function):
    """Decorator requires user to be onboarded.
    """
    @wraps(function)
    def wrapper(*args, **kwargs):
        try:
            # making request directly to core django. alternatively, we could
            # make the request to the request.get_host() (but then a bit
            # tricky if it is local development and accessing cep.dev)
            r = requests.get("http://django:6000/api/workbench/", cookies=request.cookies)
            r.raise_for_status()
            json_response = r.json()
            redirect_url = request.url_root.split(',')[0] if ',' in request.url_root else request.url_root

            if json_response['response']['setupComplete']:
                return function(*args, **kwargs)
            else:
                return redirect(redirect_url + '/workbench/onboarding')
        except Exception as e:
            logger.error(e)
            raise Forbidden
        else:
            return function(*args, **kwargs)
    return wrapper


def check_db_timestamp_and_cache_validity(db_file):
    """ Check if cache should be updated as data db file has been modified

        :param str db_file: path to file where results are derived.
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            current_data_db_timestamp = os.path.getmtime(db_file)
            cached_data_db_timestamp = cache.get(db_file)
            logger.debug("Getting cache results for {}: current file's modified time {}"
                         " vs cached modified time {}.".format(db_file,
                                                               current_data_db_timestamp,
                                                               cached_data_db_timestamp))
            if cached_data_db_timestamp != current_data_db_timestamp:
                logger.info("Removing cache related to file '{}' as it has been updated.".format(db_file))
                cache.clear()
                cache.set(db_file, current_data_db_timestamp)
            return f(*args, **kwargs)
        return wrapper
    return decorator


def memoize_db_results(db_file):
    """Provided cached results derived from a rarely changing db file

    This decorator uses diskcache (`cache.memoize decorator`) to cache different
    responses based upon the function+arguments.

    If our data db file has been updated (i.e different timestamp), we should
    invalidate that cache.

    :param str db_file: path to file where results are derived.

    """

    def decorator(f):
        @check_db_timestamp_and_cache_validity(db_file)
        @cache.memoize()
        @wraps(f)
        def wrapper(*args, **kwargs):
            return f(*args, **kwargs)
        return wrapper
    return decorator
