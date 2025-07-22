/*
This file listens adds event listeners to the dashboard page.
*/
export { addEditListener, initFormListeners }
import { date_to_yyyymmdd } from "../../../general/js/utils.js";
import { getFormData, getSearchResults, loadSearchResults, exitSearchResults, clearForm } from "./search.js";

function addEditListener(entryObject, date) {
    /*
    Adds an event listener to the edit button of the entry object.
    */
    const editButton = entryObject.querySelector('.edit-button');
    editButton.addEventListener('click', async () => {
        window.location.href = '/diary/edit?date=' + date_to_yyyymmdd(date);
    });
}

let searchCache = null; // Cache for most recent search result. Used when sorting data to avoid re-requesting data.
function initFormListeners() {
    const sortSelect = document.querySelector('.sort-form').querySelector('.sort-type')
    const orderSelect = document.querySelector('.sort-form').querySelector('.sort-order')

    /* Form submission */
    function loadResults() {       
        /* Helper function for loadSearchResults() call */     
        loadSearchResults(searchCache, sortSelect.value, orderSelect.value == "ascending");
    }

    async function submitForm() {
        const formData = getFormData();
        if (formData["text-text"].length === 0 && formData["tags"].length === 0) {
            exitSearchResults();
        } else {
            searchCache = await getSearchResults(formData)
            loadResults();
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
        clearForm();
    })

    sortSelect.addEventListener("change", loadResults)
    orderSelect.addEventListener("change", loadResults)

}
