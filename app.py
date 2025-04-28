import csv
import os
from flask import Flask, render_template, send_from_directory, request, Response, url_for, jsonify

app = Flask(__name__)

@app.route("/")
def main():
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
    values = list(json.values())
    if '' in values:
        return Response(response='One or more of your fields is blank', status=400)

    try:
        filename = request.headers['File']
        num_lines = len(list(csv.reader(open(f'res/{filename}.csv'))))
        with open(f"res/{filename}.csv", "a") as file:
            writer = csv.writer(file)

            values = [num_lines]+values # Add an ID to the new row
            writer.writerow(values)
    except Exception as e:
        return Response(response=f'Something went wrong: {e} (code 500)', status=500)
    else:
        return Response(response=f'{num_lines}', status=201)

@app.route("/edit", methods=["POST"])
def update_db():
    """
    Takes:
    {
        "File": <filename w/o extension>, (in header)
        "id": <id of element to change>,
        ... (rest of information to update)
    }
    And updates this element in the DB.
    Returns 400 if id/file doesn't exist, 500 if an unknown error occurs, and 201 if the resource was successfully edited.
    If "name" is empty, the entry is deleted.
    """
    json = request.get_json()
    filename = f'res/{request.headers['File']}.csv'
    id = json['id']

    if not os.path.exists(filename):
        return Response(response=f'The specified file ({filename}) does not exist.', status=400)

    if '' in [json['start'], json['end'], json['color']]:
        return Response(response='One or more of your fields is blank', status=400)

    try:
        # It is not convenient ot edit specific lines in a CSV file directly, so we will
        # simply construct the entire file again and write that to the file.
        with open(filename, 'r') as file:
            reader = csv.reader(file, delimiter=',')
            new_file = [] # List of rows
            for row in reader:
                print(row)
                if row[0] == str(id):
                    # If the name is empty, we want to delete the record (see docstring),
                    # so we don't add a new row.
                    if json['name']:
                        new_file.append([json['id'], json['name'], json['start'], json['end'], json['color']])
                else:
                    new_file.append(list(row))

        print(new_file)
        # Now it has been constructed, write to disk
        with open(filename, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerows(new_file)
    except Exception as e:
        return Response(response=f'Something went wrong: {e}', status=500)
    else:
        return Response(status=201)

@app.route("/data", methods=["GET"])
def fetch_data():
    # We return the current contents of the the databases in the requested scope and return them.
    # Aliases: * for all data, . for most recent entry. Otherwise takes comma-separated filenames
    # e.g. 24-apr,25-apr,26-apr
    final_json = {}
    for filename in os.listdir('res'): # Iterate through each day
        day_json = []
        with open(f'res/{filename}', 'r') as file:
            reader = csv.reader(file)
            for line in reader:
                # Account for legacy items
                if len(line) == 4:
                    color = "220,220,220"
                    id, name, start, end = line
                elif len(line) == 5:
                    id, name, start, end, color = line

                day_json.append({
                    "id": id,
                    "name": name,
                    "start": start,
                    "end": end,
                    "color": color
                })

        # Take only file name - e.g. just "24-apr" from "24-apr.csv" for the entry in the json
        name = os.path.splitext(filename)[0]
        final_json[name] = day_json

    return jsonify(final_json)

# TODO: Make Scope parameter actually work
# TODO: Use Scope instead of custom code to revise edited/added element HTML via /data
# TODO: esc exists
# TODO: better time validation (serverside) and placement (probably also serverside)
# TODO: adds new file each new day
# TODO: allow deletion of entire day (?)
# TODO: identical names merge into same element - this happens on backend as adding is now handled by backend too via /data
# TODO: make tags less dumb (don't rely on colors rather ids probably)
# TODO: pie chart of each tag per day (+general per-day info)
app.run(port=8000)
