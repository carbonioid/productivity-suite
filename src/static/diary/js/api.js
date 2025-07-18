import { date_to_yyyymmdd } from "../../general/js/utils.js";

/*
This file makes request to the database (adding, deleting entries, etc.)
*/
export { addEntry, editEntry, deleteEntry, getSettings, getTagIndex }

async function addEntry(date, title, entry, ratings, tags) {
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
            date: date_to_yyyymmdd(date),
            title: title,
            entry: entry,
            ratings: ratings,
            tags: tags
        })
    });
}

async function editEntry(date, title, entry, ratings, tags) {
    /*
    Edit an entry in the database.
    Returns the response from the server.
    */
    return await fetch("/diary/api/edit", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            date: date_to_yyyymmdd(date),
            title: title,
            entry: entry,
            ratings: ratings,
            tags: tags
        })
    });
}

async function deleteEntry(date) {
    /*
    Delete an entry from the database.
    Returns the response from the server.
    */
    return await fetch(`/diary/api/delete`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            date: date_to_yyyymmdd(date)
        })
    });
}

async function getJSON(endpoint) {
    return await fetch(endpoint)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error; status: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => { console.error('Error fetching generic JSON:', error); })
    .then(data => {
        return data;
    })
}

async function getSettings() {
    return await getJSON('/diary/api/settings')
}

async function getTagIndex() {
    return await getJSON('/diary/api/tag-index')
}