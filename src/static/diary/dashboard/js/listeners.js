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

function initFormListeners() {
    async function submitForm() {
        const formData = getFormData();
        if (formData["text-text"].length === 0 && formData["tags"].length === 0) {
            exitSearchResults();
        } else {
            loadSearchResults(await getSearchResults(formData));
        }
    }

    const form = document.querySelector(".search-form")
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await submitForm();
    })

    const button = form.querySelector(".search-button")
    button.addEventListener('click', async () => {
        await submitForm();
    })

    const exitButton = document.querySelector(".exit-search-button")
    exitButton.addEventListener("click", () => {
        exitSearchResults();
    })

    const tagForm = document.querySelector(".tag-select")
    const tagInput = tagForm.querySelector(".search-bar")
    tagInput.addEventListener("focus", () => {
        tagForm.classList.remove("collapsed")
    })

    // Listen for clicks off the input (unfocusing) to collapse the menu.
    // Do not listen for focusout because this activates when the user tries to select tags.
    document.addEventListener("click", (event) => {
        if (!tagForm.contains(event.target)) {
            tagForm.classList.add("collapsed")
        }
    })
}
