export { getSelectedTags, setSelectedTags, loadTagInput, parseTagNames }
import { getTagIndex } from "./api.js"
import { loadTemplate } from "../../general/js/template.js"

/* form functions */
function getTags(form) {
    return Array.from(form.querySelector('.tag-menu').children)
    .filter(tag => tag.classList.contains("tag") && !tag.classList.contains("adapt-tag"))
}

function getSelectedTags(form) {
    return getTags(form).filter(tag => {return tag.classList.contains('selected')})
}

function parseTagNames(tags) {
    return tags.map(tag => tag.textContent)
}

function setSelectedTags(tagNames, form) {
    /*
    Add .selected class (and move to top of list) for all tags with .textContent matching a value in tagNames. 
    Case sensitive (but tag names are always lowercase).
    Affects tags from `form`.
    */
    const tags = getTags(form);
    
    for (const tag of tags) {
        if (tag.classList.contains("selected")) deselectTag(tag)
        if (tagNames.includes(tag.textContent)) selectTag(tag)
    }
}

/* listeners */
function selectTag(tag) {
    /*
    Select this tag and move it upwards, if necessary.
    Parent is assumed to be tag.parentElement

    IMPORTANT: this should be the only way that tags are selected.
    Otherwise, the value of the indicator will be out of sync because it is only called here.
    */
    if (!tag) {throw Error("Tag provided to selectTag was undefined. Expected Node object.")}
    
    const tagMenu = tag.parentElement
    const tagForm = tagMenu.parentElement
    tag.classList.add("selected")

    // Move to top of menu (after all selected tags)
    const tags = getSelectedTags(tagForm).filter(ctag => ctag.textContent != tag.textContent) // Get all tags except ourselves
    if (tags.length === 0) {
        const allTags = getTags(tagForm);
        tagMenu.insertBefore(tag, allTags[0])
    } else {
        tags.at(-1).after(tag)
    }

    setIndicatorValue(tagForm)
}

function deselectTag(tag) {
    /*
    Deselect a tag:
    - Remove the selected class
    - Move below all selected tags
    */
    const tagMenu = tag.parentElement
    const tagForm = tagMenu.parentElement
    tag.classList.remove("selected")

    const selectedTags = getSelectedTags(tagForm)

    // If there are any selected tags, move this tag to exactly after the last one.
    if (selectedTags.length > 0) {
        selectedTags.at(-1).after(tag)
    }

    setIndicatorValue(tagForm)
}

function addTagListeners(tag) {
    tag.addEventListener('click', () => {
        tag.classList.toggle("selected")

        if (tag.classList.contains("selected")) selectTag(tag)
        else deselectTag(tag)
    })
}

function addAdaptTagListeners(adaptTag, tagForm) {
    // If the adapt tag is selected, we need to add a regular tag which has its input. Never modify the adapt-tag, though
    const tagMenu = tagForm.querySelector(".tag-menu")
    const tagInput = tagForm.querySelector(".search-bar")
    adaptTag.addEventListener("click", () => {
        const tagNames = parseTagNames(getTags(tagForm))
        if (!tagNames.includes(tagInput.value)) {
            const tag = loadTag(tagInput.value, tagMenu) 
            selectTag(tag)
        }
    })
}

function setIndicatorValue(tagForm) {
    const indicator = tagForm.querySelector(".search-bar-placeholder")

    const selectedTags = getSelectedTags(tagForm)
    if (selectedTags.length > 0) {
        // Add appropriate content to indicator
        indicator.value = parseTagNames(selectedTags).join(' • ')
    } else {
        indicator.value = "";
    }
}

function addCollapseListeners(tagForm) {
    const tagInput = tagForm.querySelector(".search-bar")
    const indicator = tagForm.querySelector(".search-bar-placeholder")
    // Listen for clicks off the input (unfocusing) to collapse the menu.
    // Do not listen for focusout because this activates when the user tries to select tags.
    document.addEventListener("click", (event) => {
        if (!tagForm.contains(event.target)) {
            tagForm.classList.add("collapsed")
        }
        else if (tagForm.classList.contains("collapsed") && indicator.contains(event.target)) {
            // Uncollapse form and focus real input (because the user will have clicked on the indicator)
            tagForm.classList.remove("collapsed")
            tagInput.focus()
        }
    })
}

function addInputListeners(tagForm, tagInput, adaptable) {
    // Listener for searching
    tagInput.addEventListener('input', () => {
        // Iterate through all tags and check if the substring in the input exists. If so, show it. Otherwise, hide.
        const searchStr = tagInput.value;
        let tagFound = false; // Whether a tag was found to *not* hide. This is used on a non-adaptable to show the empty message.

        for (const tag of getTags(tagForm)) { // Iterate through all regulars tags - we never hide the adapt tag
            if (tag.textContent.includes(searchStr.toLowerCase())) {
                tagFound = true;
                tag.classList.remove("hidden")
            } else {
                tag.classList.add("hidden")
            }
        }
        
        if (adaptable) {
            const adaptTag = tagForm.querySelector(".adapt-tag")

            // If input is empty, hide the adapt tag
            // If a perfect match exists, hide the tag (otherwise there are two duplicates of the same text)
            const tagNames = parseTagNames(getTags(tagForm))
            if (tagInput.value.trim().length == 0 || tagNames.includes(tagInput.value)) {
                adaptTag.classList.add("hidden")
            } else {
                adaptTag.textContent = tagInput.value
                adaptTag.classList.remove("hidden")
            }
        } else {
            const emptyMsg = tagForm.querySelector('.empty-msg')
            if (!tagFound) emptyMsg.classList.remove("hidden")
            else emptyMsg.classList.add("hidden")
        }
    })

}

function initTagListeners(tagForm, adaptable) {
    /*
    See loadTagInput() for explanation of adaptable parameter.
    Init the listeners for a tag input (but not the tags themselves)
    */
    const tagInput = tagForm.querySelector(".search-bar")

    addCollapseListeners(tagForm)

    addInputListeners(tagForm, tagInput, adaptable)

    // Add listener for adapt tag
    if (adaptable) addAdaptTagListeners(tagForm.querySelector(".adapt-tag"), tagForm)
}

/* compilation functions */
function loadTag(name, container) {
    /*
    Load a tag into `container` with name `name`. Returns
    the Node object of the tag that was just added.
    */
    if (container == undefined) container = document.querySelector(".tag-menu")
    
    const tagObj = loadTemplate(document, 'tag-template', {"name": name});
    addTagListeners(tagObj);

    container.appendChild(tagObj)

    return tagObj
}

async function loadTagInput(tagForm, adaptable) {
    /*
    Fully load tag input with class .tag-menu.
    If `adaptable` is true, this function will look for a .adapt-tag and will place the user input in that tag, and allow it to be selected
    If `adaptable` is false, the function will look for a .empty-msg and display that if there are no results.
    */
    const tags = Object.entries(await getTagIndex());
    tags.sort((a, b) => b[1]-a[1]) // Sort, putting items with most instances at the top.
    for (const tag of tags) {
        const [name, _] = tag;
        loadTag(name, tagForm.querySelector(".tag-menu"))
    }

    // Show empty message if there are no tags
    if (tags.length == 0) {
        document.querySelector(".empty-msg").classList.remove("hidden")
    }

    initTagListeners(tagForm, adaptable);
}
