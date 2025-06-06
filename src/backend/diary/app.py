from flask import Flask, render_template, request, Response, jsonify, Blueprint
from backend.diary.database import fetch_db_contents, add_row, edit_row

diary_bp = Blueprint('diary', __name__)

@diary_bp.route("/")
def main():
    return render_template('diary.html')
