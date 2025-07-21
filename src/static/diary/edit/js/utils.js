import { yyyymmdd_to_date } from "../../../general/js/utils.js";

export {getDateMinusDays, getPageDate, dashboardRedirect }

function getDateMinusDays(date, days) {
    const millisecondsInDay = 86400000
    const newDate = new Date();
    newDate.setTime(date.getTime() - days*millisecondsInDay); // Subtract 'days' from the current date via milliseconds, so that it can roll over into months and years.
    return newDate
}

function getPageDate() {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    if (date) {
        return yyyymmdd_to_date(date)
    } else {
        return new Date(); // Default to today if no date is provided in url params
    }
}

function dashboardRedirect() {
    // clear url params and redirect to dashboard
    window.history.replaceState(null, '', '/diary');

    // Reload the window (otherwise the dashboard will not actually be redirected to)
    window.location.reload();
}
