from functools import wraps
from werkzeug.exceptions import Forbidden
from diskcache import Cache
import os
import logging

logger = logging.getLogger(__name__)

cache = Cache("database_cache")


def onboarded_required(function):
    """Decorator requires user to be logged in and onboarded.
    """

    @wraps(function)
    def wrapper(*args, **kwargs):
        request = args[0]
        if request.user.is_authenticated and request.user.profile.setup_complete:
            return function(*args, **kwargs)
        else:
            raise Forbidden

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
