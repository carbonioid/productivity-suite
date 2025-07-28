from backend.timetracker.database import fetch_db_contents
from backend.common.search_base import SearchHandler, generic_string_match
from backend.timetracker.utils import hhmm_to_minutes

def data_function():
    """
    This function grabs all individual activites/tasks from each day as
    a separate object and returns them in one flat list so that they can be searched
    properly. Each item has a .date attribute added so that their parent day can be identified.
    """
    all_activities = []
    data = fetch_db_contents("*")
    for date, activities in data.items():
        for activity in activities:
            activity["date"] = date
            all_activities.append(activity)
    
    return all_activities

def totals_function(results, query):
    # Get total time
    total_time = 0
    for result in results.values():
        start, end = hhmm_to_minutes(result['start']), hhmm_to_minutes(result['end'])
        total_time += start-end
    
    return {
        "time": total_time
    }

def color_condition(condition, item):
    cond_color = condition['query']
    item_color = item['color']

    # Split rgb into list of r, g, b values
    cond_color, item_color = map(int, cond_color.split(',')), map(int, item_color.split(','))

    # Return whether both equal as a boolean
    return cond_color == item_color
    
def time_condition(condition, item):
    start, end = hhmm_to_minutes(condition['min']), hhmm_to_minutes(condition['max']) # get start & end boundaries as minutes integer
    item_start, item_end = hhmm_to_minutes(item['start']), hhmm_to_minutes(item['end'])

    if (start <= item_start and end >= item_end): return 1
    else: return 0

handler = SearchHandler({
    "name": lambda condition, item: generic_string_match(condition, item['name']),
    "color": color_condition,
    "time": time_condition
}, totals_function, data_function)
