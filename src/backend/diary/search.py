"""
Evaluator for search queries in api/search route
"""
from backend.diary.database import fetch_db_contents

def evaluate_search(main_group):
    # TODO: VERIFICATION
    data = fetch_db_contents("*", False)

    results = []
    for item in data:
        matches = eval_group(main_group["conditions"], item)
        if matches != 0:
            results.append({
                "result": item, 
                "matches": matches
            })
    
    return results

def eval(condition, item):
    """General router for evaluation"""
    if condition["type"] == "group":
        return eval_group(condition["conditions"], item)
    else:
        return int(eval_condition(condition, item)) # If true, return 1 match. Otherwise 0

def eval_condition(condition, item):
    if condition["type"] == "title":
        text = condition["text"]
        title = item["title"]
        if not condition["case-sensitive"]:
            title = title.lower()
            text = text.lower()
        
        return text in title
    
    if condition["type"] == "body":
        text = condition["text"]
        body = item["entry"]
        if not condition["case-sensitive"]:
            body = body.lower()
            text = text.lower()
        
        return text in body

    if condition["type"] == "tag":
        return condition["name"].lower() in item["tags"]

    if condition["type"] == "rating":
        for rating in item["ratings"]:
            if rating["name"] == condition["name"] or condition["name"] is None and \
                rating["value"] >= rating["min"] or rating["min"] is None and \
                rating["value"] <= rating["max"] or rating["max"] is None:
                return True
        
        return False

def eval_group(conditions, item):
    """
    Returns how many matches `item` rec eieved for this list of conditions. Returns 0 if it matched none or failed a required condition.

    Args:
        group (_type_): _description_
        data (_type_): _description_
    """
    total_matches = 0
    for condition in conditions:
        if (matches:=eval(condition, item)) > 0: # if >0 matches
            total_matches += matches
        elif condition["required"]:
            return 0 # required check failed, instantly fail this item
    
    return total_matches
