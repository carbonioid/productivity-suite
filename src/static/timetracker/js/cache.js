export { fetchDay, getDay, populateCache, getAllEntryDates }

let cache = new Map();

async function fetchDay(name) {
    const data = await fetch("/timetracker/data", {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Scope': name
        }
    }).then(response => {return response.json()})
    
    const day = data[name]
    cache.set(name, day)
    return day
}

function getDay(name) {
    return cache.get(name);
}

async function populateCache() {
    /*
    Populate the cache with all entries from the backend
    */
    const names = []
   
    await fetch("/timetracker/data", {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Scope': '*'
        }
    }).then(response => {
        return response.json()
    }).then(data => {
        Object.entries(data).forEach(pair => {
            const [name, value] = pair;
            cache.set(name, value)
        })
    })
}

function getAllEntryDates() {
    return Array.from(cache.keys())
}
