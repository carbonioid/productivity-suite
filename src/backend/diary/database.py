import csv, json

DATABASE_PATH = 'src/backend/diary/entries.csv'

def fetch_db_contents(scope: list):
    """Take scope as list of YYYY-MM-DD dates and return the full data for these dates in formatted JSON

    Args:
        scope (list): list of YYYY-MM-DD dates (or "*" if all dates are to be fetched)
    """

    entries = []
    with open(DATABASE_PATH, 'r') as file:
        reader = csv.reader(file)
        for line in reader:
            date = line[0] 
            if date in scope or scope == '*':
                entries.append({
                    'date': line[0],
                    'entry': line[1],
                    'values': json.loads(line[2])
                })

    return entries

def add_entry(date, entry, values):
    # Check that there isn't already an entry for this day
    current_date_entry = fetch_db_contents([date])

    if current_date_entry:
        raise ValueError('An entry for this date already exists')
    else:
        with open(DATABASE_PATH, 'a') as file:
            writer = csv.writer(file)
            writer.writerow((date, entry, json.dumps(values)))

def edit_entry(date, new_entry, new_values):
    # TODO: validate values
    # Get current rows
    with open(DATABASE_PATH, 'r') as file:
        reader = csv.reader(file)
        rows = list(reader)

    # Modify them in memory
    new_rows = []
    for row in rows:
        if row[0] == date:
            new_rows.append([date, new_entry, json.dumps(new_values)])
        else:
            new_rows.append(row)
    
    # Rewrite to file
    with open(DATABASE_PATH, 'w') as file:
        writer = csv.writer(file)
        writer.writerows(new_rows)
