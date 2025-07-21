export {showEmptyMessage, hideEmptyMessage}

function showEmptyMessage(container, titleMessage, message) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add("empty-container")

    let icon = document.createElement('span');
    icon.classList.add("material-symbols-outlined")
    icon.classList.add("empty-icon")
    icon.textContent = "blur_on";

    let title = document.createElement('h2');
    title.classList.add("empty-title")
    title.textContent = titleMessage

    let content = document.createElement('p');
    content.classList.add("empty-content")
    content.textContent = message;

    messageContainer.appendChild(icon);
    messageContainer.appendChild(title);
    messageContainer.appendChild(content);

    container.appendChild(messageContainer)
}

function hideEmptyMessage(container) {
    const emptyContainer = container.querySelector('.empty-container');
    if (emptyContainer) {
        emptyContainer.remove();
    }
}