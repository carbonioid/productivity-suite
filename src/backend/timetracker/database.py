import csv, os
from pathlib import Path
from backend.timetracker.utils import hhmm_to_minutes, pathto

def fetch_db_contents(scope: list):
    """
    Scope: list of filenames e.g. (e.g. src/timetracker/res/2025-05-02.csv)
    Returns: JSON. Format: {name: data}. (name is e.g. 2025-05-02 - only filename)

    Takes scope as list of filenames (e.g. 2025-05-02.csv) and returns their contents in neatly formatted JSON to be passed to the frontend.
    Sorts them in order of start time.
    Returns None if one of the files in the scope doesn't exist.
    """

    final_json = {}
    for filename in scope: # Iterate through each day        
        file_json = []
        if not os.path.exists(filename):
            print(f'{filename} was invalid ({scope=})')
            return None

        with open(filename, 'r') as file:
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

        # Take only file name - e.g. just "2025-01-01" from "2025-01-01.csv" for the entry in the json
        name = Path(filename).stem
        final_json[name] = sorted(file_json, key=lambda x: hhmm_to_minutes(x['start']))

    return final_json

def add_row(filename, name, start, end, color):
    """
    Adds this entry to the file at `filename`. Returns the id of the newly added row.
    If the name of the entry is the same as the name of the entry it is adjacent to (its start = its end),
    then simply merge the two and don't actually add a new item.
    """
    filepath = pathto(filename)

    num_lines = len(list(csv.reader(open(filepath)))) # This is the row's id.
    with open(filepath, "a") as file:
        writer = csv.writer(file)

        values = [num_lines, name, start, end, color] # Add an ID to the new row
        writer.writerow(values)
    
    combination_check(filename)

def edit_row(filename, id, new_name, new_start, new_end, new_color):
    filepath = pathto(filename)

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

    combination_check(filename)

def delete_row(filename, id):
    filepath = pathto(filename)

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

def clean_file_ids(filepath):
    """
    Clean any ids that are not sequential in this life - e.g. 6 followed by 8 becomes 6 followed by 7
    """
    # Create list of correct ids
    with open(filepath, 'r') as file:
        reader = csv.reader(file)
        new_rows = []
        for i, row in enumerate(reader):
            new_rows.append([i]+row[1:])
    
    # Write this list to the file
    with open(filepath, 'w') as file:
        writer = csv.writer(file)
        writer.writerows(new_rows)

def invalid(json, day, ignore=None):
    """
    the `ignore` parameter is a list of ids to ignore - used in overlap checking
    Takes a request JSON (from /edit or /add) and verifies it:
        (1) the new end time must be after the new start time (equal timestamps are valid)
        (2) checks there are no blank fields
        (3) the request file exists (so no other functions have to do this check)
        (4) checks that these timestamps do not overlap any other events in the given `day`

    Returns the error message if invalid, None otherwise
    """

    if ignore is None: ignore = []

    if hhmm_to_minutes(json['end']) < hhmm_to_minutes(json['start']): return "The times you inputted aren't valid." # (1)

    if '' in json.values(): return 'One or more of your fields is blank' # (2)

    start, end = hhmm_to_minutes(json['start']), hhmm_to_minutes(json['end'])
    data = fetch_db_contents([pathto(day)])
    if data is None: return f"The requested file ({day}) does not exist" # (3)

    # Check no times overlap - (4)
    for row in data[day]:
        if row['id'] not in ignore:
            row_start, row_end = hhmm_to_minutes(row['start']), hhmm_to_minutes(row['end'])
            # Either: it starts before the new activity but ends after it starts OR it starts somewhere in this activity
            if (row_start < start < row_end) or (start < row_start < end):
                return f"The inputted activity overlaps another: {row['name']}"

    return None # not invalid

def combination_check(filename):
    """
    Check if any parts of the databse need to be combined (items with same name & color that are adjacent and combine them.)
    """
    filepath = pathto(filename)
    data = fetch_db_contents([filepath])

    # Check if the adjacent item has the same name - if so, merge
    prev_item = {'name': None, 'start': None, 'end': None, 'color': None}
    for row in data[filename]:
        if row['start'] == prev_item['end'] and \
            row['name'] == prev_item['name'] and \
            row['color'] == prev_item['color']:
            edit_row(filename, row['id'], row['name'], prev_item['start'], row['end'], row['color'])
            delete_row(filename, prev_item['id'])

        prev_item = row
    
    # Some IDs are now not sequential, which will mess with the rest of the code - fix this.
    clean_file_ids(filepath)
