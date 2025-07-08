import os
from datetime import datetime
from backend.common.utils import missing_dates

def hhmm_to_minutes(string):
    hours, minutes = map(int, string.split(':'))
    return (60 * hours) + minutes

def add_new_files():
    """
    Add any files (dates) that are between the first entry and today but not in the filesystem.
    Format: YYYY-MM-DD.csv
    """
    # List comprehension that gets all .csv files and then gets the most recent one with [-1]
    dates = [os.path.splitext(file)[0] for file in os.listdir('src/backend/timetracker/res') if os.path.splitext(file)[1] == '.csv']
    current_date = str(datetime.today().date())

    missing = missing_dates(dates, end=current_date)

    for date in missing:
        open(f'src/backend/timetracker/res/{date}.csv', 'x') # Create file; it doesn't exist
