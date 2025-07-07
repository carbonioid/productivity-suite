import csv, json
import re
from datetime import datetime, timedelta

DATABASE_PATH = 'src/backend/diary/entries.csv'

def add_entry_padding(entries):
    """
    Add padding to a list of entries: all dates not present between the starting & ending date will be added as empty entries.
    IMPORTANT: Assumes the `entries` list is sorted
    """
    if len(entries) < 2: # if 1-length, none of this is needed.
        return entries
    
    entry_dates = [entry['date'] for entry in entries]

    # get start & end date as datetime objects
    start_date = datetime.strptime(entry_dates[-1], '%Y-%m-%d')
    end_date = datetime.strptime(entry_dates[0], '%Y-%m-%d')

    # Get all dates inbetween them
    dates_inbetween = []
    current_date = start_date + timedelta(days=1)
    while current_date < end_date:
        dates_inbetween.append(current_date)
        current_date += timedelta(days=1)

    # Check for any not present in the list
    for date in dates_inbetween:
        yyyymmdd_date = str(date.date())
        if yyyymmdd_date not in entry_dates:
            entries.append({
                'date': yyyymmdd_date,
                'empty': True
            })

    # Resort array & return
    return sorted(entries, key=lambda x: x['date'], reverse=True)

def validate_ratings(ratings):
    """
    Validate this list of ratings. Returns None if valid, or an error message if invalid.
    """
    for rating in ratings:
        if not isinstance(rating, dict):
            return f"Ratings must be a list of dictionaries (for {rating=})"
        if 'value' not in rating or 'name' not in rating or 'min' not in rating or 'max' not in rating or 'color' not in rating:
            return f"Ratings must contain value, name, min, max and color keys (for {rating=})"
        if not isinstance(rating['value'], int):
            return f"Rating value must be an integer (for {rating=})"
        if not isinstance(rating['name'], str):
            return f"Rating name must be a string (for {rating=})"
        if not isinstance(rating['color'], str):    
            return f"Rating color must be a string (for {rating=})"
        if not isinstance(rating['color'], str) or not re.match(r'^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$', rating['color']):
            return f"Rating color must be a valid hex color (for {rating=})"
        
        if not isinstance(rating['min'], int) or not isinstance(rating['max'], int):
            return f"Rating min and max must be integers (for {rating=})"
        if not rating['max'] >= rating['value'] >= rating['min']:
            return f"Rating value must be between min and max (for {rating=})"
    
    return None

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
    
    entries = sorted(entries, key=lambda x: x['date'], reverse=True)
    entries = add_entry_padding(entries)

    return entries

def add_entry(date, title, entry, ratings, tags):
    # Check that there isn't already an entry for this day
    date_entry = fetch_db_contents([date])

    if date_entry:
        raise ValueError('An entry for this date already exists')
    elif (message := validate_ratings(ratings)) is not None:
        raise ValueError(message)
    else:
        with open(DATABASE_PATH, 'a') as file:
            writer = csv.writer(file)
            writer.writerow((date, title, entry, json.dumps(ratings), json.dumps(tags)))

def edit_entry(date, new_title, new_entry, new_ratings, new_tags):
    # Validate ratings
    if (message := validate_ratings(new_ratings)) is not None:
        raise ValueError(message)

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

def delete_entry(date):
    # Get current rows
    with open(DATABASE_PATH, 'r') as file:
        reader = csv.reader(file)
        rows = list(reader)

    # Modify them in memory
    new_rows = []
    found_row = False
    for row in rows:
        if row[0] == date: found_row = True # if this row matches the date, we want to delete it
        else: new_rows.append(row) # Otherwise, we want to keep this row
    
    if not found_row:
        raise ValueError('An entry for that date does not exist')
    
    # Rewrite to file
    with open(DATABASE_PATH, 'w') as file:
        writer = csv.writer(file)
        writer.writerows(new_rows)
