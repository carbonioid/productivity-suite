/*
SERVERSIDE:
* /add-entry { text, ratings }
* /data (to request entries back)

* /search (to search entries) (opt)

CLIENTSIDE:
* JAVA: Integrate with /data to load abritrary entires
* HTML: add entry button
* JAVA: adding that entry & reloading entries (?)
* HTML: context menu linking to detailed view for day

* HTML/JAVA: search function (opt)
*/

const button = document.querySelector('.see-more-button')
const entry = document.querySelector(".entry")
button.addEventListener('click', () => {
    entry.classList.toggle("expanded-entry")
})
