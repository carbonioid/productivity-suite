export { initCollapseButtonListeners, initSliderListeners}

function initSliderListeners() {
    const containers = document.querySelectorAll('.slider-container')

    containers.forEach(container => {
        const slider = container.querySelector('.slider')
        const sliderValue = container.querySelector('.slider-value')

        console.log(slider.value)

        sliderValue.textContent = slider.value
        slider.addEventListener('input', () => {
            sliderValue.textContent = slider.value
        })
    })
}

function initCollapseButtonListeners() {
    const collapseButton = document.querySelector('.collapse-button')
    const memoryContainer = document.querySelector('.memory-container')

    collapseButton.addEventListener('click', () => {
        memoryContainer.classList.toggle('hidden')
        collapseButton.classList.toggle('switched')
    })
}