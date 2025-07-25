class SearchHandler:
    def __init__(self, condition_functions, data_function, totals_function=None):
        self.condition_functions = condition_functions
        self.data_function = data_function
        self.totals_function = totals_function
    
    def eval_group(self, conditions, item):
        """
        Returns how many matches `item` receieved for this list of conditions. 
        Returns 0 if it matched none or failed a required condition.

        Args:
            conditions (list): The list of conditions
            item (?): The item to check the conditions against. Likely JSON, but the
                        condition functions will accept any type.
        """
        total_matches = 0
        for condition in conditions:
            if (matches:=self.eval(condition, item)) > 0: # if >0 matches
                total_matches += matches
            elif condition["required"]:
                return 0 # required check failed, instantly fail this item
        
        return total_matches

    def eval(self, condition, item):
        """General router for evaluation"""
        if condition["type"] == "group":
            return self.eval_group(condition["conditions"], item)
        else:
            function = self.condition_functions.get(condition["type"])
            if function is None: raise ValueError(f"Condition function for `{condition['type']}` is not implemented. Query could not be properly evaluated.")
            return function(condition, item)
        
    def evaluate_search(self, query_body):
        if query_body is None:
            raise ValueError("main group not supplied")
        if query_body["type"] != "group":
            raise TypeError("main group must be of type group")
        if len(query_body["conditions"]) == 0:
            raise TypeError("main group must have at least one condition")
        if query_body["required"] == False:
            raise TypeError("main group must be required")
        
        data = self.data_function()
        
        results = []
        for item in data:
            # This may error, and this should be handled by the user. No try statement is included.
            matches = self.eval_group(query_body["conditions"], item)
            if matches != 0:
                results.append({
                    "result": item, 
                    "matches": matches
                })
    
        return results

    def handle_search(self, query):
        """
        Main entry point for implementation of this function. 
        Takes `entry` as a python object and returns as defined in `search.md`
        """
        results = self.evaluate_search(query)
        if self.totals_function:
            totals = self.totals_function(results, query)
        else:
            totals = None
        
        return {
            "results": results,
            "totals": totals
        }

"""
Useful defaults that can be used for custom implementations of the function
"""
def generic_string_match(condition, string):
    """
    Return how many times `substring` appears in `string` and adhere to properties like `case-sensitive`
    Assumes that the substring we are searching for is `query` in `condition`
    `string` should generally come from accessing a property of `item` e.g. `item["text"]`
    """
    substring = condition['query']
    
    if condition.get('case-sensitive') == False:
        substring = substring.lower()
    
    return string.count(substring)
