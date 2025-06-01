const button = document.querySelector('.see-more-button')
const entry = document.querySelector(".entry")
button.addEventListener('click', () => {
    entry.classList.toggle("expanded-entry")
})
