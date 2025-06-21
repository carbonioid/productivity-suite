const collapseButton = document.querySelector('.collapse-button')
const memoryContainer = document.querySelector('.memory-container')

collapseButton.addEventListener('click', () => {
    memoryContainer.classList.toggle('hidden')
    collapseButton.classList.toggle('switched')
})
