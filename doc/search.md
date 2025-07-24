# Search API
The search function is an extensible API that can be used to construct complex search queries with fairly similar setup and query construction.

## Groups
The body of a request to an implementation of the search API consists of a list of nested match groups and conditions. 
> A match group is a list of conditions which all contribute to a single outcome

> A condition is a single condition which can either fail or succeed when evaluating a single item in the database. These are the smallest units of a search query.

Within a group's list of conditions, either a regular condition or another group can be nested. For example, a group might look like this:
```json
{
    "type": "group",
    "required": true,
    "conditions": [
        {"type": "title", "query": "the", ...},
        {
            "type": "group",
            "required": false,
            "conditions": [
                ...
            ]
        },
        {"type": "body", "query": "good day", ...}
    ]
}
```
More formally, a group is constructed as such:
```json
{
    "type": "group",
    "required": bool,
    "conditions": list
}
```
The conditions list is a list of other conditions (see below) or other groups. A group is considered to have not matched if either of two criteria are met:
1. A condition in `conditions` marked as `required=true` is not met, or
2. No conditions are met

Otherwise, the group is considered to have matched and will be treated as a single, successful condition by whichever group it is nested within

## Conditions
Conditions are the part of the query that the individual implementation can customise. Their base implementation looks like this:
```json
{
    "type": str,
    "query": str,
    "required": bool,
    ... (any other parameters)
}
```
Additionally, the default API provides the optional `case-sensitive` option, which is generally handled by invidual functions themselves.

The implementation may choose to implement any other optional parameters to conditions, but be aware that your custom condition evaluation functions will have to be able to use them.

> When initialising an implementation of the search API, the user will pass a number of functions, each matched to a condition `type` that can evaluate a query of that type on an invidiual database entry and return an integer corresponding to the number of matches that condition has on that entry.

> If the function encounters a `type` of condition that does not have a matching implementation, the `handle_search` function will throw a `ValueError`


## Request schema
The body of a request to an implementation of the search API begins with a single highest-level group. Some special properties apply to this group:
1. It must exist (not be `None`)
2. It must be of type `group`
3. It must have at least one condition
4. It must be required

> If any of these are failed, the `handle_search` function will throw a `ValueError`

## Response schema
The search response consists of a list of entries, ordered by number of search hits;
```json
[
    {
        "result": JSON,
        "matches": int
    },
    {
        "result": JSON,
        "matches": int
    }
]
```
and, optionally, a `totals` section where the user may choose to include some diagnostics about the search as a whole (e.g. total matches, date range of matches, whether the most recent entry is in the results.) If an implenetation for this is not provided, it will simply be blank.
```json
{
    key: value,
    ...
}
```
These two parts combine to form this schema, which is returned as the response body if the query is successful.
```json
{
    "totals": { ... },
    "results": [ ... ]
}
```

# Python implementation
The `backed/common/search_base.py` function defines a main entry point in the `SearchHandler` class. It requires three parameters to be passed for initialisation:

## `condition_functions`
```py
{
    "type": function(condition, database_item),
    ...
}
```
Each function will be run when encountering the specific type it is linked to. 

It will only be passed single conditons and database items, not match groups nor the whole database. These are abstracted away by the base implementation.

This function should return an `int` denoting how many matches this condition had on this database entry (there may be multiple matches for a condition e.g. in text matching so this is an int rather than a bool)

## `totals_functions` (optional)
```py
function(results, query)
```
This functions constructs the `totals` section of the response.

It is passed the results of the query, as defined in "response schema" and the query itself, as defined in "request schema."

It should return a dict of key-value pairs, as defined in "response schema."

> This parameter is optional. If not passed, the `totals` section will default to being empty.

## `data_function`
```py
function()
```
This function is used to fetch the database entries on which to run the query itself.

It should return an iterable of suitable parmeters to pass to condition functions from the database.

In the future, it is planned for this function to take some parameters such a date range, but this is not yet implemented. Therefore, this function should return the contents of the *entire* datbase.

An implementation for this function might look like:
```py
    "data_function": lambda: get_database_contents('all')
```

## Using the `Entry` class
Initialise the class:
```py
from backend.common.search_base import SearchHandler
handler = SearchHandler(condition_functions, totals_function, data_function)
```
Once an instance of the search class has been initialised, you may simply get the results of a query like this:
```py
results = handler.handle_search(query)
```
Where `query` is a decoded JSON object (i.e. to a python dictionary or list). The return type is a python dictionary

> This function may throw errors (e.g. if it is misconfigured or the query is malformed). It is up to the implementation itself to handle these gracefully.

# Individual implementations
Most apps in this project implement a version of the search API. Below are the lists of conditions for each individual implementation:

## Diary
### title
To test if the title contains `text` as a substring anywhere:
```json
{
    "type": "title",
    "query": str,
    "case-sensitive": bool,
    "required": bool
}
```

### body
To test if the body of the entry contains `text` as a substring anywhere:
```json
{
    "type": "body",
    "query": str,
    "case-sensitive": bool,
    "required": bool
}
```

### tags
To check if the entry has a tag with the name `name`:
```json
{
    "type": "tag",
    "query": str,
    "required": bool
}
```
Note that there is no case-sensitivity option because tags are already stored as all-lowercase. The `"name"` field will be automatically lowercased in the backend.

### ratings
```json
{
    "type": "rating",
    "query": str,
    "required": bool,
    "min": int,
    "max": int
}
```
The `min` and `max` parameters provide an additional layer of verification by constraining the `value` parameter of the rating. Various fields may be set as `null` in this request:
1. To have either `min` or `max` not be considered, set them as `null`.
2. To have this condition not consider the rating's name, set `name` to `null`.
