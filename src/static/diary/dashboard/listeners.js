/*
This file listens adds event listeners to the dashboard page.
*/
export { addEditListener }

function addEditListener(entryObject, date) {
    /*
    Adds an event listener to the edit button of the entry object.
    */
    const editButton = entryObject.querySelector('.edit-button');
    editButton.addEventListener('click', async () => {
        window.location.href = '/diary/add?date=' + date;
    });
}