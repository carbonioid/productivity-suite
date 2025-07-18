/*
This file listens adds event listeners to the dashboard page.
*/
export { addEditListener, addTagListeners, initFormListeners }
import { date_to_yyyymmdd } from "../../../general/js/utils.js";
import { getFormData, getSearchResults, loadSearchResults, exitSearchResults } from "./search.js";

function addEditListener(entryObject, date) {
    /*
    Adds an event listener to the edit button of the entry object.
    */
    const editButton = entryObject.querySelector('.edit-button');
    editButton.addEventListener('click', async () => {
        window.location.href = '/diary/edit?date=' + date_to_yyyymmdd(date);
    });
}

function addTagListeners(tag) {
    tag.addEventListener('click', () => {
        tag.classList.toggle('selected')
    })
}

let searchCache = null; // Cache for most recent search result. Used when sorting data to avoid re-requesting data.
function initFormListeners() {
    const sortSelect = document.querySelector('.sort-form').querySelector('.options')

    /* Form submission */
    async function submitForm() {
        const formData = getFormData();
        if (formData["text-text"].length === 0 && formData["tags"].length === 0) {
            exitSearchResults();
        } else {
            searchCache = await getSearchResults(formData)
            loadSearchResults(searchCache, sortSelect.value);
        }
    }

    const form = document.querySelector(".search-form")
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await submitForm();
    })

    /* Search results */
    const exitButton = document.querySelector(".exit-search-button")
    exitButton.addEventListener("click", () => {
        exitSearchResults();
    })

    sortSelect.addEventListener("change", () => {
        loadSearchResults(searchCache, sortSelect.value);
    })

    /* Tag input */
    let tempValue = ''
    const tagForm = document.querySelector(".tag-select")
    const tagMenu = tagForm.querySelector(".tag-menu")
    const tagInput = tagForm.querySelector(".search-bar")
    // Listen for clicks off the input (unfocusing) to collapse the menu.
    // Do not listen for focusout because this activates when the user tries to select tags.
    document.addEventListener("click", (event) => {
        if (!tagForm.contains(event.target)) {
            tagForm.classList.add("collapsed")

            // Add indicator for selected tags on focusout, if any selected
            const selectedTags = getFormData()["tags"]
            if (selectedTags.length > 0) {
                // Change content to indicator (and save in temp so can be put back)
                tagInput.value = selectedTags.join(' • ')

                // Make text color change
                tagInput.classList.add("indicating")
            } else {
                tagInput.value = '';
            }
        }
        else if (tagInput.contains(event.target)) {
            tagInput.value = tempValue
            tagInput.classList.remove("indicating")

            tagForm.classList.remove("collapsed")
        }
    })

    // Listener for searching
    const emptyMsg = tagForm.querySelector('.empty-msg')
    tagInput.addEventListener('input', (event) => {
        tempValue = tagInput.value
        // Iterate through all tags and check if the substring in the input exists. If so, show it. Otherwise, hide.
        const searchStr = tagInput.value;
        let tagFound = false; // Whether a tag was found to *not* hide
        for (const tag of Array.from(tagMenu.children)) {
            if (tag.textContent.includes(searchStr.toLowerCase())) {
                tagFound = true;
                tag.classList.remove("hidden")
            } else {
                tag.classList.add("hidden")
            }
        }

        if (!tagFound) {
            emptyMsg.classList.remove("hidden")
        } else {
            emptyMsg.classList.add("hidden")
        }
    })
}
