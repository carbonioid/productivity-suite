# Diary API documentation
# Searching (`/api/search` route)
The body of a request to the `/api/search` route consists of a list of nested match groups. A match group is a list of conditions (either optional or required) which contribute to the group's criteria being fulfilled. Other match groups can also be nested within parent match group so that they contribute to the success of the parent group. For example, an example of matching groups might look like this:
```json
{
    "type": "group",
    "required": true,
    "conditions": [
        {"type": "title", "search": "the", ...},
        {
            "type": "group",
            "required": false,
            "conditions": [
                ...
            ]
        },
        {"type": "body", "search": "good day", ...}
    ]
}
```
Note that the highest-level group will always be required, as otherwise the search would match all entries indiscriminately.

## Group schema
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
Otherwise, the group is considered to have matched.

## Request schema
The schema for the entire search request consists of one large (required) group. If no parameters are passed (or the highest-level condition is not `type=group`), the request will return a `400 BAD REQUEST` error. All conditions in groups (unless other groups) will be conditions relating to criteria valid entries must meet. Below is the schema for each such request:

### title
To test if the title contains `text` as a substring anywhere:
```json
{
    "type": "title",
    "text": str,
    "case-sensitive": bool,
    "required": bool
}
```

### body
To test if the body of the entry contains `text` as a substring anywhere:
```json
{
    "type": "body",
    "text": str,
    "case-sensitive": bool,
    "required": bool
}
```

### tags
To check if the entry has a tag with the name `name`:
```json
{
    "type": "tag",
    "name": str,
    "required": bool
}
```
Note that there is no case-sensitivity option because tags are already stored as all-lowercase. The `"name"` field will be automatically lowercased in the backend.

### ratings
```json
{
    "type": "rating",
    "name": str,
    "required": bool,
    "min": int,
    "max": int
}
```
The `min` and `max` parameters provide an additional layer of verification by constraining the `value` parameter of the rating. Various fields may be set as `null` in this request:
1. To have either `min` or `max` not be considered, set them as `null`.
2. To have this condition not consider the rating's name, set `name` to `null`.


## Response schema
The search response consists of a list of entries, ordered by number of search hits.
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