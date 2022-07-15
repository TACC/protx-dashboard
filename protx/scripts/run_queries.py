from protx.api import get_maltreatment_cached, get_demographics_cached, get_resources_cached
import time

def call_function_and_report(f):
    start = time.time()
    print(f"{f.__name__} ...")
    f()
    total_time = time.time() - start
    print(f"  {f.__name__} completed in {total_time} seconds")

functions_to_cache = [get_maltreatment_cached, get_demographics_cached, get_resources_cached]

print(f" Running {len(functions_to_cache)} methods in order to cache their results")

for func in functions_to_cache:
    call_function_and_report(func)

print("Completed.")
