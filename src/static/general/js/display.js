export { init }
import { getCookies } from "./utils.js"
/*
Consistent API to handle display options
*/

/*
Class to watch for mutation on class of other object.
Thank you to TechWisdom on stackoverflow for the base of this code (I have modified it for my use-case.)
*/
class ClassWatcher {
    constructor(targetNode, classToWatch, callback) {
        this.targetNode = targetNode
        this.classToWatch = classToWatch
        this.callback = callback

        this.observer = null
        this.lastClassState = targetNode.classList.contains(this.classToWatch)

        this.init()
    }

    init() {
        this.observer = new MutationObserver(this.mutationCallback)
        this.observe()
    }

    observe() {
        this.observer.observe(this.targetNode, { attributes: true })
    }

    mutationCallback = mutationsList => {
        for(let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                let currentClassState = mutation.target.classList.contains(this.classToWatch)
                if(this.lastClassState !== currentClassState) {
                    this.lastClassState = currentClassState
                    this.callback(this.targetNode.classList.contains(this.classToWatch))
                }
            }
        }
    }
}

function initDisplayOption(id, targetNode, targetClass, targetFunction, triggerNode, triggerClass, _default) {
    // Helper function that can be run to change the class and update cookies, so that there are not conflicting implementations.
    function modifyTriggerNodeClass(remove) {
        console.log(`removing=${true} for ${id}`)
        if (remove) triggerNode.classList.remove(triggerClass)
        else        triggerNode.classList.add(triggerClass)
        
        document.cookie = `display-options-${id}=${!remove}`
    }
    // Create new watcher for mutation events
    if (targetClass) {
        let _  = new ClassWatcher(targetNode, targetClass, (hasClass) => {
            modifyTriggerNodeClass(!hasClass) // if has class, do not remove.
        })
    }

    triggerNode.addEventListener("click", () => {
        const state = triggerNode.classList.contains(triggerClass)

        // Add and remove class from targetNode - this will trigger the dom watcher, 
        // which will in turn modify the classes for this button.
        // This is so that any mutations on these classes are automatically 
        // registered on display buttons. However, it must be ensured that the classes
        // of these buttons are never programatically changed.
        if (targetClass) {
            if (triggerNode.classList.contains(triggerClass)) {
                targetNode.classList.remove(targetClass)
            } else {
                targetNode.classList.add(targetClass)
            }
        } else {
            // If we aren't editing a class, then the mutation observer will not fire
            // which means that the trigerNode's class will not be changed automaticaly. Therefore,
            // we have to do this manually.
            modifyTriggerNodeClass(triggerNode.classList.contains(triggerClass))
        }

        // Run triger function if exists.
        // Invert the value because we want to give the value for what
        // the state will be after this click, not before.
        // (and the state doesn't reliably update, so we use the one we saved earlier.)
        if (targetFunction) {
            targetFunction(!state)
        }
    })
}

function init(config) {
    /*
    Main entry point for configuring display options.
    Config format:
    [
        {
            id: str (the id of this option in cookies - all ids must be unique),
            targetNode: Node,
            targetClass: str (optional, if targetFunction is passed)
            targetFunction: function (optional, if targetClass is passed - is run on trigger, passed boolean of triggerNode has triggerClass)
            triggerNode: Node,
            triggerClass: str (optional - defaults to "switched"),
            default: bool (optional - whether the objects should start with their classes switched on),
        },
        ...
    ]

    IMPORTANT:
    all triggerNodes must begin without triggerClass and all targetNodes must begin without targetClass.
    Otherwise listeners will not be activated properly.
    */
    for (const row of config) {
        // First, validate that all needed config is present.
        if (!row.id || !row.targetNode || !row.triggerNode || !(row.targetClass || row.targetFunction)) {
            console.error(`Please ensure all options are passed correctly to display options config (offending row: ${JSON.stringify(row)})`)
            return;
        }

        initDisplayOption(row.id, row.targetNode, row.targetClass, row.targetFunction,
                          row.triggerNode, row.triggerClass || "switched", row.default)
    }

    // Initialise values only after all listeners have been set
    for (const row of config) {
        // Set value from document cookies
        const cookies = getCookies();
        const value = cookies[`display-options-${row.id}`]

        // If either
        // (a) the state of the cookie is stored as on in cookies;
        // (b) or there is no stored state and the default is on, then:
        // set the row to on.
        if (value === 'true' || (row.default && value == undefined)) {
            row.triggerNode.dispatchEvent(new Event("click"))
        }
    }
}