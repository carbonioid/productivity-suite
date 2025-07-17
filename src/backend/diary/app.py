import werkzeug, json
from datetime import date
from flask import render_template, request, Blueprint, Response, jsonify
from backend.diary.database import fetch_db_contents, add_entry, edit_entry, delete_entry
from backend.diary.search import evaluate_search

diary_bp = Blueprint('diary', __name__)

@diary_bp.route("/", methods=["GET"])
def main_route():
    return render_template('diary/dashboard.html')

@diary_bp.route("/edit", methods=["GET"])
def add_route():
    return render_template('diary/edit.html')

@diary_bp.route("/api/data", methods=["GET"])
def query_db_route():
    """Get data from entries.csv based on a specified list of dates, or all (*)

    Headers:
        'Scope': * or JSON list of dates (as text) e.g. ["2025-05-05", "2025-05"-06"]
        'padding': bool (whether to pad the entries, which notes where there are missing entries up to today)
        
    """
    if request.headers['Scope'] == '*':
        scope = '*'
    else:
        try:
            scope = json.loads(request.headers['Scope'])
        except json.decoder.JSONDecodeError: # If JSON loading fails
            return Response(response='The supplied scope was not valid JSON', status=400)
        
    # Convert padding to boolean
    padding = request.headers.get('padding', "false")
    padding = {"false": False, "true": True}.get(padding, False)

    queried_entries = fetch_db_contents(scope, add_padding=padding)
    return jsonify(queried_entries), 200

@diary_bp.route("/api/add", methods=["POST"])
def add_entry_route():
    """Add row to entries.csv

    Request body: JSON (application/json)
    {
        "date": text (YYYY-MM-DD),
        "title": text,
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
        add_entry(body["date"], body["title"], body["entry"], body["ratings"], body["tags"])
    except Exception as e:
        if (type(e) is ValueError and str(e) == 'An entry for this date already exists'):
            return Response(response='An entry for this date already exists', status=409)
        else:
            return str(e), 400

    return '', 201

@diary_bp.route("/api/edit", methods=["POST"])
def edit_entry_route():
    """Edit row in entries.csv

    Request body: JSON (application/json)
    {
        "date": text,
        "title": text,
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
        edit_entry(body['date'], body['title'], body['entry'], body['ratings'], body['tags'])
    except Exception as e:
        return str(e), 400

    return '', 201

@diary_bp.route("/api/delete", methods=["DELETE"])
def delete_entry_route():
    """Delete row in entries.csv

    Request body: JSON (application/json)
    {
        "date": text
    }
    """
    try:
        body = request.get_json()
    except werkzeug.exceptions.BadRequest:
        return Response(response='The supplied body was not valid JSON', status=400)
    
    try:
        delete_entry(body['date'])
    except Exception as e:
        return str(e), 400
    
    return '', 204

@diary_bp.route("/api/search", methods=["GET"])
def search_entries_route():
    """
    Search entries using the schema provided in the request body.
    See docs/api_diary.md for more details.
    """

    try:
        body = request.get_json()
    except werkzeug.exceptions.BadRequest:
        return Response(response='The supplied body was not valid JSON', status=400)
    
    try:
        results = evaluate_search(body)
    except Exception as e:
        return str(e), 400
    
    return jsonify(results), 200

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
