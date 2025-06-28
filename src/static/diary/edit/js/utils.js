export {getDateMinusDays}

function getDateMinusDays(date, days) {
    const newDate = new Date();
    newDate.setDate(date.getDate() - days); // Subtract 'days' from the current date
    return newDate.toISOString().split('T')[0]; // Extract only the YYYY-MM-DD part
}
