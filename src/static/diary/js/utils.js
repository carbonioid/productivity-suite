export { format_yyyymmdd }

function format_yyyymmdd(string) {
    let [year, month, day] = string.split('-');
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "June",
        "July", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];
    month = months[Number(month)-1]
    return `${Number(day)} ${month} ${year}`
}
