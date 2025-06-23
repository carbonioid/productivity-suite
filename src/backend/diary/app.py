import werkzeug, json
from datetime import date
from flask import render_template, request, Blueprint, Response, jsonify
from backend.diary.database import fetch_db_contents, add_entry, edit_entry

diary_bp = Blueprint('diary', __name__)

@diary_bp.route("/", methods=["GET"])
def main_route():
    return render_template('diary/dashboard.html')

@diary_bp.route("/add", methods=["GET"])
def add_route():
    return render_template('diary/add.html')

@diary_bp.route("/api/data", methods=["GET"])
def query_db_route():
    """Get data from entries.csv based on a specified list of dates, or all (*)

    Request body: * or JSON list of dates (as text)
    *
    OR
    ["2025-05-05", "2025-05"-06"]
    """
    if request.headers['Scope'] == '*':
        scope = '*'
    else:
        try:
            scope = json.loads(request.headers['Scope'])
        except json.decoder.JSONDecodeError: # If JSON loading fails
            return Response(response='The supplied scope was not valid JSON', status=400)
    
    queried_entries = fetch_db_contents(scope)
    return jsonify(queried_entries), 200

@diary_bp.route("/api/add", methods=["POST"])
def add_entry_route():
    """Add row to entries.csv

    Request body: JSON (application/json)
    {
        "entry": text,
        "ratings": JSON,
        "tags": JSON (list)
    }
    """

    try:
        body = request.get_json()
    except werkzeug.exceptions.BadRequest:
        return Response(response='The supplied body was not valid JSON', status=400)
    
    current_date = date.today().isoformat()

    try:
        add_entry(current_date, body["entry"], body["ratings"], body["tags"])
    except Exception as e:
        if (type(e) is ValueError and str(e) == 'An entry for this date already exists'):
            return Response(response='An entry for today already exists', status=409)
        else:
            return str(e), 400

    return '', 201

@diary_bp.route("/api/edit", methods=["POST"])
def edit_entry_route():
    """Edit row in entries.csv

    Request body: JSON (application/json)
    {
        "date": text,
        "entry": text,
        "ratings": JSON,
        "tags": JSON (list)
    }
    """

    try:
        body = request.get_json()
    except werkzeug.exceptions.BadRequest:
        return Response(response='The supplied body was not valid JSON', status=400)
    
    try:
        edit_entry(body['date'], body['entry'], body['ratings'], body['tags'])
    except Exception as e:
        return str(e), 400

    return '', 201

@diary_bp.route("/api/settings", methods=["GET"])
def get_settings_route():
    """Return settings from settings.json"""
    try:
        with open('src/backend/diary/settings.json', 'r') as file:
            settings = json.load(file)
    except FileNotFoundError:
        return Response(response='Settings file not found', status=404)
    except json.JSONDecodeError:
        return Response(response='Settings file is not valid JSON', status=400)

    return jsonify(settings), 200
