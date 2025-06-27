/*
This file makes request to the database (adding, deleting entries, etc.)
*/
export { addEntry, getSettings }

async function addEntry(title, entry, ratings, tags) {
    /*
    Add an entry to the database.
    Returns the response from the server.
    */
    return await fetch("/diary/api/add", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            entry: entry,
            ratings: ratings,
            tags: tags
        })
    });
}

async function getSettings() {
    return await fetch('/diary/api/settings')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error; status: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => { console.error('Error fetching settings:', error); })
    .then(settings => {
        return settings;
    })
}
