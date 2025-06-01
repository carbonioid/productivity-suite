import traceback
from flask import Flask, Response
from timetracker.timetracker import timetracker_bp

app = Flask(__name__)
app.register_blueprint(timetracker_bp, url_prefix='/timetracker')

@app.errorhandler(Exception)
def handle(e):
    print(f'Error occured: {e}')
    traceback.print_exception(e)
    return Response(response=f'Something went wrong: {e}', status=500)

app.run(port=8000, host="0.0.0.0")
