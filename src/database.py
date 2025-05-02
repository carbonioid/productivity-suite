import csv, os
from utils import hhmm_to_minutes

def fetch_db_contents(scope):
    """
    Takes scope as list of filenames and returns their contents in neatly formatted JSON to be passed to the frontend.
    Sorts them in order of start time.
    Returns None if one of the files doesn't exist.
    """

    final_json = {}
    for filename in scope: # Iterate through each day
        file_json = []
        filepath = f'res/{filename}.csv'
        if not os.path.exists(filepath):
            print(f'{filepath} was invalid')
            return None

        with open(filepath, 'r') as file:
            reader = csv.reader(file)
            for line in reader:
                id, name, start, end, color = line

                file_json.append({
                    "id": id,
                    "name": name,
                    "start": start,
                    "end": end,
                    "color": color
                })

        # Take only file name - e.g. just "24-apr" from "24-apr.csv" for the entry in the json
        name = os.path.splitext(filename)[0]
        final_json[name] = sorted(file_json, key=lambda x: hhmm_to_minutes(x['start']))

    return final_json

def add_row(filename, name, start, end, color):
    """
    Adds this entry to the file at `filename`. Returns the id of the newly added row and None if the file doesn't exist.
    """
    filepath = f'res/{filename}.csv'

    if not os.path.exists(filepath): return None

    num_lines = len(list(csv.reader(open(filepath)))) # This is the row's id.
    with open(filepath, "a") as file:
        writer = csv.writer(file)

        values = [num_lines, name, start, end, color] # Add an ID to the new row
        writer.writerow(values)

    return num_lines

def edit_row(filename, id, new_name, new_start, new_end, new_color):
    filepath = f'res/{filename}.csv'

    if not os.path.exists(filepath): return None

    # It is not convenient ot edit specific lines in a CSV file directly, so we will
    # simply construct the entire file again and write that to the file.
    with open(filepath, 'r') as file:
        reader = csv.reader(file, delimiter=',')
        new_file = [] # List of rows
        for row in reader:
            if row[0] == str(id):
                new_file.append([id, new_name, new_start, new_end, new_color])
            else:
                new_file.append(list(row))

    # Now it has been constructed, write to disk
    with open(filepath, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(new_file)

    return True

def delete_row(filename, id):
    filepath = f'res/{filename}.csv'

    if not os.path.exists(filepath): return None

    # Iterate through and add items to a new file, except the deleted row.
    with open(filepath, 'r') as file:
        reader = csv.reader(file, delimiter=',')
        new_file = [] # List of rows
        for row in reader:
            if row[0] != str(id):
                new_file.append(list(row))

    # Now it has been constructed, write to disk
    with open(filepath, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(new_file)

    return True
