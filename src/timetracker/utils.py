import os
from datetime import date

def hhmm_to_minutes(string):
    hours, minutes = map(int, string.split(':'))
    return (60 * hours) + minutes

def add_new_file_if_needed():
    """
    Adds a new file to res/ if needed.
    Format: YYYY-MM-DD.csv
    """
    # List comprehension that gets all .csv files and then gets the most recent one with [-1]
    files = [os.path.splitext(file)[0] for file in os.listdir('res/') if os.path.splitext(file)[1] == '.csv']
    current_date = date.today().isoformat()

    if current_date not in files:
        open(f'res/{current_date}.csv', 'x') # Create file; it doesn't exist
