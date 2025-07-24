"""
Evaluator for search queries in api/search route
"""
from backend.diary.database import fetch_db_contents
from backend.common.search_base import SearchHandler, generic_string_match

def rating_condition(condition, item):
    """Because ratings should not have duplicates this function is boolean, effectively"""
    for rating in item["ratings"]:
        if rating["name"] == condition["query"] or condition["query"] is None and \
            rating["value"] >= rating["min"] or rating["min"] is None and \
            rating["value"] <= rating["max"] or rating["max"] is None:
            return 1
        
    return 0

def tag_condition(condition, item):
    """Because ratings should not have duplicates this function is boolean, effectively"""
    return int(condition["query"].lower() in item["tags"])

handler = SearchHandler(
    condition_functions={
        "title": lambda condition, item: generic_string_match(condition, item["title"]),
        "body": lambda condition, item: generic_string_match(condition, item["entry"]),
        "tag": tag_condition,
        "rating": rating_condition
    },
    data_function=lambda: fetch_db_contents("*", False)
)
