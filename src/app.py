import os
import traceback
from flask import Flask, render_template, request, Response, jsonify
from database import fetch_db_contents, add_row, edit_row, delete_row
from utils import hhmm_to_minutes, time_validation, add_new_file_if_needed

app = Flask(__name__)

@app.route("/")
def main():
    """
    Main route for the website. Renders the website and also runs additional checks on load:
        (1) Adds a new day file if one currently doesn't exist
    """
    add_new_file_if_needed() # (1)

    return render_template("index.html")

# This part of the code keeps a live, up-to-date version of the current data on-screen
# so that it isn't lost on refresh and can be loaded when the page is opened after being closed
# It is stored in res/data.csv
@app.route("/add", methods=["POST"])
def upload():
    # POST method: adding an item.
    # Returns 400 if the data is invalid, 201 otherwise
    # On the 201 response, returns the new database entry.
    json = request.get_json()
    filename = request.headers['File']
    filepath = f'res/{filename}.csv'
    values = list(json.values())

    if '' in values:
        return Response(response='One or more of your fields is blank', status=400)

    if not time_validation(json['start'], json['end']):
        return Response(response="The times you inputted aren't valid.", status=400)

    try:
        new_id = add_row(filename, *values)
        if new_id is None:
            return Response(response=f'The selected day ({filepath}) does not exist.')
        else:
            return Response(response=str(new_id), status=201)

    except Exception as e:
        return Response(response=f'Something went wrong: {e} (code 500); more info: {traceback.format_exc()}', status=500)

@app.route("/edit", methods=["POST"])
def update_item():
    """
    Takes:
    headers:
        "File": <filename w/o extension>, (in header)
    body:
        {
            "id": <id of element to change>,
            ... (rest of information to update e.g. name, color)
        }
    And updates this element in the DB.
    Returns 400 if id/file doesn't exist, 500 if an unknown error occurs, and 201 if the resource was successfully edited.
    """
    json = request.get_json()
    filename = request.headers['File']

    if '' in json.values():
        return Response(response='One or more of your fields is blank', status=400)

    try:
        outcome = edit_row(filename, *json.values())
        if outcome is None: return Response(response=f'The specified day ({filename}) does not exist.', status=400)
        else: return Response(status=201)

    except Exception as e:
        return Response(response=f'Something went wrong: {e}', status=500)

@app.route("/delete", methods=["POST"])
def delete_item():
    """
    Takes:
    headers:
        "File": <filename w/o extension e.g. 24-apr> (in header)
    body:
        {
            "id": <id of element to change>,
        }
    And updates this element in the DB.
    Returns 400 if file doesn't exist, 500 if an unknown error occurs (or the id is invalid), and 201 if the resource was successfully edited.
    """
    json = request.get_json()
    filename = request.headers['File']

    try:
        outcome = delete_row(filename, json['id'])
        if outcome is None: return Response(response=f'The specified day ({filename}) does not exist.', status=400)
        else: return Response(status=201)

    except Exception as e:
        return Response(response=f'Something went wrong: {e}', status=500)

@app.route("/data", methods=["GET"])
def fetch_data():
    # We return the current contents of the the databases in the requested scope and return them.
    # Aliases: * for all data, . for most recent entry. Otherwise takes comma-separated filenames
    # e.g. 24-apr,25-apr,26-apr
    scope = request.headers['Scope']
    if scope == '*': # All files
        scope = [str(n).replace('.csv', '') for n in os.listdir('res')]
    else:
        scope = scope.split(',')

    data = fetch_db_contents(scope)
    if data is not None:
        return jsonify(data)
    else:
        return Response('The Scope that you supplied was invalid.', status=400)

# fix "hide other days"
# just make the fields required rather than backend validation
# TODO: pie chart of each tag per day (+general per-day info)
# TODO: we need to make the layout options better on the backend - just make a function "modifyRow" or "modifyDays" that you can run. Then both load() and the dropdowns can use it.
# TODO: flask default error handling?
# TODO: make tags less dumb (don't rely on colors rather ids probably - red, blue etc)
# TODO: identical names merge into same element - this happens on backend as adding is now handled by backend too via /data
# TODO: realtime visualistaion of what you're adding?
# TODO: make some documentation
# TODO: clean-up database stuff - add common function for db writing and validation (and better validation in general)
# TODO: ability to "select day" to add things to it
app.run(port=8000)
