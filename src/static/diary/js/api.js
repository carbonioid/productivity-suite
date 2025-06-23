/*
This file makes request to the database (adding, deleting entries, etc.)
*/
export { addEntry }

async function addEntry(entry, ratings, tags) {
    /*
    Add an entry to the database.
    Returns the response from the server.
    */
    return await fetch("/diary/add", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            entry: entry,
            values: ratings,
        })
    });
}
