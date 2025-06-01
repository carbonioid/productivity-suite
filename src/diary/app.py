from flask import Flask, render_template, request, Response, jsonify, Blueprint

diary_bp = Blueprint('diary', __name__)

@diary_bp.route("/")
def main():
    return render_template('diary.html')
