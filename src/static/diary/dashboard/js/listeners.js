/*
This file listens adds event listeners to the dashboard page.
*/
export { addEditListener, addTagListeners }
import { date_to_yyyymmdd } from "../../../general/js/utils.js";

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