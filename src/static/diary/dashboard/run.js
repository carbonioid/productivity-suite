import { populateCache } from "../js/cache.js"
import { loadEntry } from "./compile.js"

// Populate cache and get dates of all entries
const entryDates = await populateCache()

// Load all entries into page from newly populated cache
entryDates.forEach(async (date) => {
    loadEntry(date, false)
})
