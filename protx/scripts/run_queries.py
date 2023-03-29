from protx.api import get_maltreatment_cached, get_demographics_cached_and_compressed, get_resources_cached_and_compressed
from protx.decorators import cache
from protx.utils.db import resources_db, cooks_db
import time
import argparse
functions_to_cache = [get_maltreatment_cached, get_demographics_cached_and_compressed, get_resources_cached_and_compressed]


def call_function_and_report(f):
    start = time.time()
    print(f"{f.__name__} ...")
    f()
    total_time = time.time() - start
    print(f"  {f.__name__} completed in {total_time} seconds")


parser = argparse.ArgumentParser(description="Run cacheable functions to cache their results",
                                 formatter_class=argparse.ArgumentDefaultsHelpFormatter)
parser.add_argument("-c", "--clear-cache", action="store_true", help="empty cache before running functions")

args = parser.parse_args()
config = vars(args)
if config['clear_cache']:
    dbs = [cooks_db, resources_db]
    print(f"Clearing existing cache related to databases: {dbs}")
    for db in dbs:
        cache.evict(db)

print(f" Running {len(functions_to_cache)} methods in order to cache their results")

for func in functions_to_cache:
    call_function_and_report(func)

print("Completed.")
