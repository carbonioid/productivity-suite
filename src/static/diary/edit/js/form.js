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
            min: parseFloat(slider.min), 
            max: parseFloat(slider.max)
        };
    });

    // Get tag data
    const tagContainer = document.querySelector('.tag-container');
    const tags = Array.from(tagContainer.querySelectorAll('div.tag')).map(tag => {
        return tag.querySelector('.tag-name').textContent.trim()
    })

    // Get entry title & entry
    const entryInput = document.querySelector('.entry-input');
    const titleInput = document.querySelector('.entry-title');
    const title = titleInput.value.trim();
    const entry = entryInput.value.trim()

    return {
        'title': title,
        'entry': entry,
        'ratings': ratings, 
        'tags': tags
    }
}
