import os
from flask import Flask, render_template, request, Response, jsonify, Blueprint
from backend.timetracker.database import fetch_db_contents, add_row, edit_row, delete_row, invalid
from backend.timetracker.utils import add_new_files

timetracker_bp = Blueprint('timetracker', __name__)

@timetracker_bp.route("/")
def main():
    """
    Main route for the website. Renders the website and also runs additional checks on load:
        (1) Adds new days files that are needed (see add_new_files docstring)
    """
    add_new_files() # (1)

    return render_template("timetracker.html")

# This part of the code keeps a live, up-to-date version of the current data on-screen
# so that it isn't lost on refresh and can be loaded when the page is opened after being closed
# It is stored in the res/ folder
@timetracker_bp.route("/add", methods=["POST"])
def upload():
    """
    Takes:
    headers:
        "File": <filename w/o extension>, (in header)
    body:
        {
            name: <new item name>,
            start: <new item start time>,
            end: <new item end time>,
            color: <new item color in "R, G, B">
        }
    And adds this element to the DB.
    Returns 400 if id/file doesn't exist, 500 if an unknown error occurs, and 201 if the resource was successfully edited.
    """
    json = request.get_json()
    filename = request.headers['File']

    valid = invalid(json, filename)
    if type(valid) == str:
        return Response(response=valid, status=400)

    add_row(filename, *json.values())
    return Response(status=201)

@timetracker_bp.route("/edit", methods=["POST"])
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

    valid = invalid(json, filename, ignore=[json['id']])
    if type(valid) == str:
        return Response(response=valid, status=400)

    edit_row(filename, *json.values())
    return Response(status=201)

@timetracker_bp.route("/delete", methods=["POST"])
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

    outcome = delete_row(filename, json['id'])
    if outcome is None: return Response(response=f'The specified day ({filename}) does not exist.', status=400)
    else: return Response(status=201)

@timetracker_bp.route("/data", methods=["GET"])
def fetch_data():
    # We return the current contents of the the databases in the requested scope and return them.
    # Aliases: * for all data. Otherwise takes comma-separated filenames e.g. 2025-05-02,2025-05-03
    scope = request.headers['Scope']
    if scope == '*': # All files
        scope = ['src/backend/timetracker/res/'+str(file) for file in os.listdir('src/backend/timetracker/res') if os.path.splitext(file)[1] == '.csv']
    else:
        scope = [f'src/backend/timetracker/res/{file}.csv' for file in scope.split(',')]

    data = fetch_db_contents(scope)
    if data is not None:
        return jsonify(data)
    else:
        return Response('The Scope that you supplied was invalid.', status=400)
