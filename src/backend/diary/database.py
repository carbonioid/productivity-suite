import csv, json
from datetime import date

DATABASE_PATH = 'src/backend/diary/entries.csv'

def fetch_db_contents(scope: list):
    """Take scope as list of YYYY-MM-DD dates and return the full data for these dates in formatted JSON

    Args:
        scope (list): list of YYYY-MM-DD dates
    """

    entries = []
    with open(DATABASE_PATH, 'r') as file:
        reader = csv.reader(file)
        for line in reader:
            date = line[0] 
            if date in scope:
                entries.append({
                    'date': line[0],
                    'entry': line[1],
                    'values': json.loads(line[2])
                })

    return entries

def add_row(entry, values):
    current_date = date.today().isoformat()
    with open(DATABASE_PATH, 'a') as file:
        writer = csv.writer(file)
        writer.writerow((current_date, entry, values))

def edit_row(date, new_entry, new_values):
    # Get current values
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
    
    print(new_rows)
    # Rewrite to file
    with open(DATABASE_PATH, 'w') as file:
        writer = csv.writer(file)
        writer.writerows(new_rows)
