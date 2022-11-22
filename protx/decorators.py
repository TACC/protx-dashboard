from functools import wraps
from werkzeug.exceptions import Forbidden
from diskcache import Cache
import os
from protx.log import logger
from flask import request, redirect
import requests
from urllib.parse import urljoin
import gzip
import json

cache = Cache("database_cache", disk_min_file_size=0, eviction_policy="none")


def get_host():
    host = request.url_root.split(',')[0] if ',' in request.url_root else request.url_root
    if host.startswith("http://cep.test"):
        host = "https" + host[4:]
    return host


def is_setup_complete() -> bool:
    host = get_host()
    if host.endswith("cep.test"):
        # unable to access cep.test (as actual site on web) so using docker service instead.  Note that staging/prod are
        # unable to use the service directly (https-requirement for uwsgi configs?)
        host = "http://core:6000"
    r = requests.get(urljoin(host, "/api/workbench"), cookies=request.cookies)
    r.raise_for_status()
    json_response = r.json()
    if 'setupComplete' in json_response['response']:
        return json_response['response']['setupComplete']
    else:
        # User isn't logged in which is unexpected as pages (which contain this SPA as an iframe)
        # are controlled by CMS which should require a login
        #
        # If if the future, CMS are no longer configured to keep pages behind login, then we should refactor
        # this function and `onboarded_user_setup_complete` to redirect to login instead of /workbench/onboarding if
        # user isn't logged in.  See https://jira.tacc.utexas.edu/browse/COOKS-279
        logger.error("User not logged in which is unexpected as CMS should be blocking pages")
        return False


def onboarded_user_setup_complete(redirect_path):
    """Decorator requires user to have setup_completed or redirects.

    :param str redirect_path: redirect location when setupComplete is false
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            try:
                if not is_setup_complete():
                    return redirect(get_host() + redirect_path)
            except Exception as e:
                logger.error(e)
                raise Forbidden
            else:
                return f(*args, **kwargs)
        return wrapper
    return decorator


def onboarded_user_required(function):
    """Decorator requires user to be onboarded.
    """
    @wraps(function)
    def wrapper(*args, **kwargs):
        try:
            if not is_setup_complete():
                raise Forbidden
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
            if cached_data_db_timestamp != current_data_db_timestamp:
                logger.info(f"Removing any cache related to file '{db_file}' as the derived file's "
                            f"modified time {current_data_db_timestamp} != cached modified time {cached_data_db_timestamp}.")
                cache.evict(db_file)
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
        @cache.memoize(tag=db_file)
        @wraps(f)
        def wrapper(*args, **kwargs):
            return f(*args, **kwargs)
        return wrapper
    return decorator


def create_compressed_json():
    """Take functions returned dictionary and convert to compressed json

    """

    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            dict_result = f(*args, **kwargs)
            json_response = json.dumps(dict_result).encode('utf8')
            compression_level = 6
            compressed_json_cont = gzip.compress(json_response, compression_level)
            return compressed_json_cont
        return wrapper
    return decorator
