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
}
