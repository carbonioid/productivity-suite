export {getDateMinusDays}

function getDateMinusDays(days) {
    const currentDate = new Date(); // Get the current date
    currentDate.setDate(currentDate.getDate() - days); // Subtract 'days' from the current date
    return currentDate.toISOString().split('T')[0]; // Extract only the YYYY-MM-DD part
}
