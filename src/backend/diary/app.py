import werkzeug, json
from datetime import date
from flask import render_template, request, Blueprint, Response, jsonify
from backend.diary.database import fetch_db_contents, add_entry, edit_entry

diary_bp = Blueprint('diary', __name__)

@diary_bp.route("/", methods=["GET"])
def main_route():
    return render_template('diary.html')

@diary_bp.route("/data", methods=["GET"])
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

@diary_bp.route("/add", methods=["POST"])
def add_entry_route():
    """Add row to entries.csv

    Request body: JSON (application/json)
    {
        "entry": text,
        "values": JSON
    }
    """

    try:
        body = request.get_json()
    except werkzeug.exceptions.BadRequest:
        return Response(response='The supplied body was not valid JSON', status=400)
    
    current_date = date.today().isoformat()

    try:
        add_entry(current_date, body["entry"], body["values"])
    except Exception as e:
        return str(e), 400

    return '', 201

@diary_bp.route("/edit", methods=["POST"])
def edit_entry_route():
    """Edit row in entries.csv

    Request body: JSON (application/json)
    {
        "date": text,
        "entry": text,
        "values": JSON
    }
    """

    try:
        body = request.get_json()
    except werkzeug.exceptions.BadRequest:
        return Response(response='The supplied body was not valid JSON', status=400)
    
    try:
        edit_entry(body['date'], body['entry'], body['values'])
    except Exception as e:
        return str(e), 400

    return '', 201
