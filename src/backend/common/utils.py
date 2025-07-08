from datetime import datetime, timedelta

def missing_dates(dates, start=None, end=None):
    """
    Return all dates between `start` and `end` inclusively that are not present in `dates`.
    Takes dates in YYYY-MM-DD format.

    Args:
        dates (list): A list of date objects to check against.
        start (date, optional): The start date for the range. Defaults to the oldest date in `dates`.
        end (date, optional): The end date for the range. Defaults to the most recent date in `dates`.
    """

    dates = sorted(dates, reverse=True)

    if start is None: start = dates[-1]
    if end is None: end = dates[0]

    # get start & end date as datetime objects
    start_date = datetime.strptime(start, '%Y-%m-%d')
    end_date = datetime.strptime(end, '%Y-%m-%d')

    # Get all dates inbetween them and find if they are missing
    missing_dates = []
    current_date = start_date
    while current_date <= end_date:
        formatted_date = str(current_date.date())

        if formatted_date not in dates:
            missing_dates.append(formatted_date)
        
        current_date += timedelta(days=1)

    return missing_dates
