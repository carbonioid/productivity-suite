export {getDateMinusDays, getPageDate, dashboardRedirect }

function getDateMinusDays(date, days) {
    const newDate = new Date();
    newDate.setDate(date.getDate() - days); // Subtract 'days' from the current date
    return newDate
}

function getPageDate() {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    return date || new Date().toISOString().split('T')[0]; // Default to today if no date is provided, in YYYY-MM-DD format
}

function dashboardRedirect() {
    // clear url params and redirect to dashboard
    window.history.replaceState(null, '', '/diary');

    // Reload the window (otherwise the dashboard will not actually be redirected to)
    window.location.reload();
}
