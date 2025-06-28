export {showEmptyMessage, hideEmptyMessage}

function showEmptyMessage(container) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add("empty-container")

    let icon = document.createElement('span');
    icon.classList.add("material-symbols-outlined")
    icon.classList.add("empty-icon")
    icon.textContent = "blur_on";

    let title = document.createElement('h2');
    title.classList.add("empty-title")
    title.textContent = 'No entries'

    let content = document.createElement('p');
    content.classList.add("empty-content")
    content.textContent = "You haven't added any entries yet. Use the form at the top to get started.";

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