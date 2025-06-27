/*
This file reads data from the form for submission to the databsae.
*/
export { getFormData}

function getFormData() {
    // Get ratings data
    const ratingContainer = document.querySelector('.rating-container');
    const ratings = Array.from(ratingContainer.querySelectorAll('.slider')).map(slider => {
        return {
            name: slider.title,
            color: window.getComputedStyle(slider.parentElement).getPropertyValue('--c'),
            value: parseFloat(slider.value),
            min: slider.min, 
            max: slider.max
        };
    });

    // Get tag data
    const tagContainer = document.querySelector('.tag-container');
    const tags = Array.from(tagContainer.querySelectorAll('div.tag')).map(tag => {
        return tag.querySelector('.tag-name').textContent.trim()
    })

    // Get actual entry & title
    const entryInput = document.querySelector('.entry-input');
    const titleInput = document.querySelector('.entry-title');
    const entry = entryInput.textContent.trim();
    const title = titleInput.value.trim();

    return [
        title,
        entry,
        ratings, 
        tags
    ]
}
