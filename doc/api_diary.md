# Diary API documentation
# Searching (`/search` route)
The search function takes a list of search terms for each part of an entry (title, body, ratings & tags) in this general form:
```json
{
    "name": str,
    "case_sensitive": bool,
    "required": bool
}
```
Required search terms are those that are needed in order for an item to appear in the search results. Optional search terms are not necessary but will increase the search's ranking (the final searches are ordered in terms of search term matches.)

## Request schema
The schema for the entire search request consists of four (optional) parameters. If no parameters are passed, the request will throw a `400 BAD REQUEST` error.
```json
{
    "title": [ ... ],
    "entry": [ ... ],
    "tags": [ ... ],
    "ratings": [ ... ]
}
```

In order of appearance, here is the schema for the parts that can appear in each of those lists (`[ ... ]`)

### title & body
The title & body searches both search text so have an identical schema:
```json
{
    "text": str,
    "case-sensitive": bool,
    "required": bool
}
```

### tags
```json
{
    "name": str,
    "required": bool
}
```
Note that there is no case-sensitivity option because tags are already stored as all-lowercase. The `"name"` field will be automatically lowercased in the backend.

### ratings
```json
{
    "name": str,
    "case-sensitive": bool,
    "required": bool,
    "min": int,
    "max": int
}
```
The `min` and `max` parameters provide an additional layer of verification. To have either `min` or `max` not be used, set them as `-1`.


## Response schema
The search response consists of a list of entries, ordered by number of search hits.
```json
[
    {
        "result": JSON,
        "matches": int
    }
]
```