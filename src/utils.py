def hhmm_to_minutes(string):
    minutes, hours = map(int, string.split(':'))
    return (60 * hours) + minutes

def time_validation(t1, t2):
    """
    Takest t1, t2 (two timestamps) and returns whether they're valid based on:
    - t2 must be after t1 (equal timestamps are invalid)
    """

    return hhmm_to_minutes(t2) > hhmm_to_minutes(t1)