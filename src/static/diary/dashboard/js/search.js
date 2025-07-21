export { loadSearchResults, getSearchResults, getFormData, exitSearchResults, clearForm}
import { yyyymmdd_to_date } from "../../../general/js/utils.js"
import { search } from "../../js/api.js"
import { loadEntry, loadAllEntries } from "./compile.js"
import { getEntry } from "../../js/cache.js"
import { getSelectedTags, setSelectedTags } from "./tag-select.js"

function getFormData() {
    const form = document.querySelector('.search-form')

    // Text search
    const text = form.querySelector('.text-input')
    const tSearchType = text.querySelector('.options').value
    const tSearchText = text.querySelector('#search-bar').value
    
    // Strict matching option (checkbox)
    const strict = document.querySelector(".strict-matching").checked
    
    return {
        "text-type": tSearchType,
        "text-text": tSearchText,
        "tags": getSelectedTags(form).map(tag => tag.textContent),
        "strict": strict
    }
}

function clearForm() {
    const form = document.querySelector('.search-form')

    const text = form.querySelector('.text-input')
    text.querySelector('.options').value = 'all'
    text.querySelector('#search-bar').value = ''

    document.querySelector(".strict-matching").checked = false

    setSelectedTags([], form)
}

async function getSearchResults(formData) {
    /*
    Perform a search to the API via the data in the form.
    The form is constructed as such:
    (1) the body and title requests are wrapped in a required group
    (2) all the tags requests are wrapped in a separate required group
    */
    const tSearchText = formData["text-text"]
    const tSearchType = formData["text-type"]
    const selectedTags = formData["tags"]
    const strict = formData["strict"]

    // Construct query
    const conditions = []

    if (tSearchText) {
        let textGroup = {
            "type": "group",
            "required": true,
            "conditions": []
        }
        let textCondTypes = []
        if (tSearchType == "all") {
            textCondTypes.push("title")
            textCondTypes.push("body")
        } else {
            textCondTypes.push(tSearchType)
        }

        for (const sType of textCondTypes) {
            textGroup["conditions"].push({
                "type": sType,
                "required": strict,
                "case-sensitive": false,
                "text": tSearchText
            })
        }

        conditions.push(textGroup)
    }

    if (selectedTags.length > 0) {
        let tagGroup = {
            "type": "group",
            "required": true,
            "conditions": []
        }
        for (const tag of selectedTags) {
            tagGroup["conditions"].push({
                "type": "tag",
                "required": strict,
                "name": tag
            })
        }

        conditions.push(tagGroup)
    }

    // Get results from query
    return await search(conditions)
}

function loadSearchResults(results, sortType, ascending) {
    if (sortType == "matches") {
        results.sort((a, b) => (b.matches - a.matches)) // sort with most matches at top
    }
    if (sortType == "date") {
        results.sort((a, b) => (yyyymmdd_to_date(b.result.date) - yyyymmdd_to_date(a.result.date))) // sort with latest date first
    }

    if (ascending) {results.reverse()} // They are currently sorted descending, flip if we are sorting asscending

    // Clear container and load results
    const container = document.querySelector('.entry-parent')
    container.innerHTML = ''

    results.forEach(async result => {
        const data = await getEntry(yyyymmdd_to_date(result.result.date))
        loadEntry(data, container)
    })

    // Show editing indicator
    const indicator = document.querySelector(".results-indicator")
    indicator.classList.remove("hidden")

    // Show indicator of how many results
    const value = document.querySelector(".num-results-value")
    const num = results.length

    if (num === 0) value.textContent = "Query returned no results"
    else if (num === 1) value.textContent = "1 search result"
    else value.textContent = `${num} search results`
}

function exitSearchResults() {
    // Hide editing indicator
    const indicator = document.querySelector(".results-indicator")
    indicator.classList.add("hidden")
    
    // Add back all results
    const container = document.querySelector('.entry-parent')
    container.innerHTML = ''
    loadAllEntries();
}
