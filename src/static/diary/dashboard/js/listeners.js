/*
This file listens adds event listeners to the dashboard page.
*/
export { addEditListener, initFormListeners, initNavListeners }
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

function initNavListeners() {
    // Display options listeners
    const entryParent = document.querySelector(".entry-parent")
    const displayOptions = document.querySelector(".display-options")
    const view = displayOptions.querySelector(".view")
    const showEmpty = displayOptions.querySelector(".show-empty")

    view.addEventListener("click", () => {
        view.classList.toggle("switched")

        // Hide empty entries & go into reader view
        if (view.classList.contains("switched")) {
            entryParent.classList.add("hide-empty")
            entryParent.classList.add("reader-view")
        } else {
            entryParent.classList.remove("hide-empty")
            entryParent.classList.remove("reader-view")
        }
    })

    showEmpty.addEventListener("click", () => {
        showEmpty.classList.toggle("switched")
        entryParent.classList.toggle("hide-empty")
    })
}
