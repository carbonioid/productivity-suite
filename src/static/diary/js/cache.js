/*
This file keeps an up-to-date, cached version of entries.csv on the clientside so that other parts of the 
javascript can interact with it without bothering the backend with too many requests.

This file uses YYYY-MM-DD format strings as cache keys but returns Date objects.
*/

export { getEntry, populateCache }
import { yyyymmdd_to_date, date_to_yyyymmdd } from "../../general/js/utils.js";

let cache = new Map();

async function getEntry(date, forceReload) {
    /*
    Get entry from cache, without refetching it.
    */
    let yyyymmdd_date = date_to_yyyymmdd(date)
    if (forceReload || !cache.has(yyyymmdd_date)) {
        /*
        Refect entry from backend, add it to cache and return it.
        */
        const data = await fetch("/diary/api/data", {
            method: "GET",
            headers: {
                'Scope': JSON.stringify([date_to_yyyymmdd(date)]),
                'padding': false
            }
        }).then(response => {return response.json()})
        
        const entry = data[0]
        if (entry) {
            entry.date = date
            cache.set(yyyymmdd_date, entry)

            return entry
        } else {
            return null
        }
    } else {
        return cache.get(date_to_yyyymmdd(date))
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
   
    return await fetch("/diary/api/data", {
        method: "GET",
        headers: {
            'Scope': '*',
            'padding': true
        }
    }).then(response => {
        return response.json()
    }).then(data => {
        data.forEach(row => {
            const yyyymmdd_date = row['date']
            const dateObj = yyyymmdd_to_date(row['date'])
            row.date = dateObj

            cache.set(yyyymmdd_date, row)
        })

        return Object.values(data)
    })
}
