export { loadSearchResults, getSearchResults }
import { yyyymmdd_to_date } from "../../../general/js/utils.js"
import { search } from "../../js/api.js"
import { loadEntry } from "./compile.js"

function getFormData() {
    const form = document.querySelector('.search-form')

    // Text search
    const text = form.querySelector('.text-input')
    const tSearchType = text.querySelector('.options').value
    const tSearchText = text.querySelector('#search-bar').value

    // Tags search
    const selectedTags = Array.from(form.querySelector('.tag-menu').children)
        .filter(tag => {return tag.classList.contains('selected')})
        .map(tag => {return tag.textContent})
    
    return [tSearchType, tSearchText, selectedTags]
}

async function getSearchResults() {
    /*
    Perform a search to the API via the data in the form.
    The form is constructed as such:
    (1) the body and title requests are wrapped in a required group
    (2) all the tags requests are wrapped in a separate required group
    */
    const [tSearchType, tSearchText, selectedTags] = getFormData();

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
                "required": false,
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
                "required": false,
                "name": tag
            })
        }

        conditions.push(tagGroup)
    }

    // Get results from query
    const results = await search(conditions)
    return results
}

function loadSearchResults(results) {
    results.sort((a, b) => (b.matches - a.matches)) // sort with most matches at top

    const container = document.querySelector('.entry-parent')
    container.innerHTML = ''

    for (const result of results) {
        const r = result.result
        r.date = yyyymmdd_to_date(r.date) // Format date properly so that loadEntry can interop with it. 

        loadEntry(result.result, container)
    }
}
