export { loadTemplate }

function loadTemplate(localDocument, id, values) {
    /*
    Fetch the template with id `id` and populate 
    spans with data-bind=key (e.g. <span data-bind="name"></span>)
    with the values in the key-value pairs in the `values` dictionary
    */
    let templateObject = localDocument.getElementById(id).content.cloneNode(true)

    Object.entries(values).forEach(pair => {
        let [name, value] = pair
        const targets = templateObject.querySelectorAll(`[data-bind="${name}"]`)
        targets.forEach(target => { target.outerHTML = value })
    })

    // Return .firstElementChild because we want to return the object not the documentfragment
    return templateObject.firstElementChild
}
