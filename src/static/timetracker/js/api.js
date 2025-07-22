export { addElement, editElement, deleteElement }
import { getAllDays } from "./utils.js";
import { load } from "./compile.js";
/* Query API and reload days */

async function addElement(name, start, end, color, day) {
    /*
    More general add-element which takes care of the entire process.
    Returns True if succesful, the error message otherwise.
    */

    if (day == undefined) {day = getAllDays()[0].id}

    // Prompt backend with new info using fetch()
    var data = JSON.stringify({
        "name": name,
        "start": start,
        "end": end,
        "color": color
    });

    const response = await fetch("/timetracker/add",  {
        method: "POST",
        headers: {
        'Content-Type': 'application/json',
        'File': day
        },
        body: data
    })

    if (response.status == 201) {
        // Update this change by re-loading the day we just added to 
        await load(day, true)

        return true
    } else {
        return (await response.text()) // return the error so form.js can deal with it.
    }
}

async function editElement(id, name, start, end, color, day) {
    var data = JSON.stringify({
        "id": id,
        "name": name,
        "start": start,
        "end": end,
        "color": color
    });
    await fetch("/timetracker/edit",  {
        method: "POST",
        headers: {
        'Content-Type': 'application/json',
        'File': day
        },
        body: data
    })
    .then(async function(response) {
        if (response.status == 201) {
        // Update this change by re-loading the day we just edited
        await load(day, true)
        } else {
        displayError(await response.text());
        }
    })
}

async function deleteElement(id, day) {
    var data = JSON.stringify({
        "id": id,
    });
    await fetch("/timetracker/delete",  {
        method: "POST",
        headers: {
        'Content-Type': 'application/json',
        'File': day
        },
        body: data
    })
    .then(async function(response) {
        if (response.status == 201) {
        // Update this change by re-loading the day we just edited
        await load(day, true)
    } else {
        displayError(await response.text());
        }
    })
}
