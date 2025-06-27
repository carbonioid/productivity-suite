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
                    'title': line[1],
                    'entry': line[2],
                    'ratings': json.loads(line[3]),
                    'tags': json.loads(line[4])
                })

    return entries

def add_entry(date, title, entry, ratings, tags):
    # Check that there isn't already an entry for this day
    current_date_entry = fetch_db_contents([date])

    if current_date_entry:
        raise ValueError('An entry for this date already exists')
    else:
        with open(DATABASE_PATH, 'a') as file:
            writer = csv.writer(file)
            writer.writerow((date, title, entry, json.dumps(ratings), json.dumps(tags)))

def edit_entry(date, new_title, new_entry, new_ratings, new_tags):
    # TODO: validate values
    # Get current rows
    with open(DATABASE_PATH, 'r') as file:
        reader = csv.reader(file)
        rows = list(reader)

    # Modify them in memory
    new_rows = []
    found_row = False
    for row in rows:
        if row[0] == date:
            found_row = True
            new_rows.append([date, new_title, new_entry, json.dumps(new_ratings), json.dumps(new_tags)])
        else:
            new_rows.append(row)
    
    if not found_row:
        raise ValueError('An entry for that date does not exist')
    
    # Rewrite to file
    with open(DATABASE_PATH, 'w') as file:
        writer = csv.writer(file)
        writer.writerows(new_rows)
