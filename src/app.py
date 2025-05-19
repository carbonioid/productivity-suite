import os, traceback
from flask import Flask, render_template, request, Response, jsonify
from database import fetch_db_contents, add_row, edit_row, delete_row, invalid
from utils import add_new_file_if_needed

app = Flask(__name__)

@app.errorhandler(Exception)
def handle(e):
    print(f'Error occured: {e}')
    traceback.print_exception(e)
    return Response(response=f'Something went wrong: {e}', status=500)

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
# It is stored in the res/ folder
@app.route("/add", methods=["POST"])
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

    new_id = add_row(filename, *json.values())
    return Response(response=str(new_id), status=201)

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

    valid = invalid(json, filename, ignore=[json['id']])
    if type(valid) == str:
        return Response(response=valid, status=400)

    edit_row(filename, *json.values())
    return Response(status=201)

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

    outcome = delete_row(filename, json['id'])
    if outcome is None: return Response(response=f'The specified day ({filename}) does not exist.', status=400)
    else: return Response(status=201)

@app.route("/data", methods=["GET"])
def fetch_data():
    # We return the current contents of the the databases in the requested scope and return them.
    # Aliases: * for all data. Otherwise takes comma-separated filenames e.g. 2025-05-02,2025-05-03
    scope = request.headers['Scope']
    if scope == '*': # All files
        scope = ['res/'+str(file) for file in os.listdir('res') if os.path.splitext(file)[1] == '.csv']
    else:
        scope = [f'res/{file}.csv' for file in scope.split(',')]

    data = fetch_db_contents(scope)
    if data is not None:
        return jsonify(data)
    else:
        return Response('The Scope that you supplied was invalid.', status=400)

app.run(port=8000, host="0.0.0.0")

# TODO: move day/week div making to new function and then load() only has to populate these divs
# TODO: refactor the contextmenu api to move it out of scope so it's not cut off (an object could be passed and then the api populates it)
# TODO: refactor to have listener.js, compile/populate.js and fetching.js (and utils obviously)

# fix collapsing/rigid mode now that we have containers - make function to return all days as singe list, probably
# popups can get cut off by week containers
# only add pie chart if day has content
# editing an activity can overlap itsef
# fix popups going off-screen
# FT: if rigid mode is disabled, untracked time isn't shown on pie charts.
# FT: up arrow to edit most recent item
# FT: more diagnostics - change pie chart to bar chart / pie and bar charts for weeks / graph for weeks or months of overall activity (or rolling average)

# FT: search function with filters
# IA: clean up styles.css
# IA: make some documentation
# FA: add more functionality to context menus - day selection and clear button (with confirm dialogue)
# FT: more input options - timer etc
# FT: combination should work for editing too (maybe remove combination; its kinda dumb)
# FT: learns from which colors preinputted things are and tries to predict?

# ----
# LONG TERM ADDITIONS:
# CGP-style goal tracker
# To-do lists (separate ones for daily and overall; daily one could overflow into next day)
# Calendar
# Port timetabler as a day-to-day / week-to-week time planner
# ----
