/*
This file keeps an up-to-date, cached version of entries.csv on the clientside so that other parts of the 
javascript can interact with it without bothering the backend with too many requests.
*/

export { getEntry, populateCache }

let cache = new Map();

async function getEntry(date, forceReload) {
    /*
    Get entry from cache, without refetching it
    */
    if (forceReload || !cache.has(date)) {
        /*
        Refect entry from backend, add it to cache and return it.
        */
        const data = await fetch("/diary/data", {
            method: "GET",
            headers: {
                'Scope': JSON.stringify([date])
            }
        }).then(response => {return response.json()})
        
        const entry = data[0]
        cache.set(date, entry)

        return entry
    } else {
        return cache.get(date)
    }
}

async function populateCache() {
    /*
    Populate the cache with all entries from the backend and return the names
    of the resulting entries (so that they can be loaded)
    */
    if (cache.size > 0) {
        // If the cache is already populated, return the names
        return Array.from(cache.keys())
    }
    const names = []
   
    await fetch("/diary/data", {
        method: "GET",
        headers: {
            'Scope': '*'
        }
    }).then(response => {
        return response.json()
    }).then(data => {
        data.forEach(row => {
            let date = row['date']
            cache.set(date, row)
            names.push(date)
        })
    })

    return names
}
