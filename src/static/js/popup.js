export { registerContextMenu, registerPopup }
/*
These are the options and functions that add event listeners
*/

function setPopupPosition(popup, mouseX, mouseY) {
    // Adjust the popup position so it follows the cursor
    // You might want to add some offset to prevent overlap
    popup.style.left = mouseX + 1 + 'px'; // Add 10px offset to the right
    popup.style.top = mouseY + 1 + 'px';  // Add 10px offset to the bottom
  
    // Keep the popup within the viewport
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
  
    if (mouseX + popupWidth > windowWidth) {
      popup.style.left = mouseX - popupWidth - 1 + 'px'; // Move to the left
    }
  
    if (mouseY + popupHeight > windowHeight) {
      popup.style.top = mouseY - popupHeight - 1 + 'px';   // Move upwards
    }
}

function toggleContextMenu(popup, show) {
    /*
    Show an animation to show or hide this popup depending on the value of `show`
    */
    const keyframes = [
        { transform: 'scale(0.9) translate(-5px, -5px)', opacity: 0},
        { transform: 'scale(1)', opacity: 1}
    ];

    const options = {
        duration: 100,
        easing: 'ease-out',
        fill: 'forwards',
        direction: show ? 'normal' : 'reverse'
    };

    const animation = popup.animate(keyframes, options)

    if (show) {
        popup.classList.remove('hidden')
    } else {
        animation.onfinish = () => { 
        console.log('finished')
        popup.classList.add('hidden') 
        }
    }

    animation.play()
}
  
function registerPopup(parent, popup) {
    /*
    Register the correct event listeners for this object's popup
    */
    parent.addEventListener('mouseenter', () => {
        popup.classList.remove('hidden')
    });

    parent.addEventListener('mouseleave', () => {
        popup.classList.add('hidden')
    })

    parent.addEventListener('mousemove', (event) => {
        // Get the coordinates of the mouse relative to the viewport
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        setPopupPosition(popup, mouseX, mouseY);
    })
}

function registerContextMenu(button, popup) {
    button.addEventListener('click', (event) => {
        // Toggle whether hidden
        toggleContextMenu(popup, popup.classList.contains('hidden'))

        // If going off screen, flip direction
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const rect = popup.getBoundingClientRect();

        if (rect.top + popup.offsetHeight > viewportHeight) {
        const value = `${viewportHeight-rect.top-popup.offsetHeight}px`
        popup.style.setProperty('top', value)
        }
    })

    document.addEventListener('click', (event) => {
        // Check if the target is a child of `button` or a child of `popup`. If not, make this popup disappear.
        if (!button.contains(event.target) && !popup.contains(event.target)) {
        if (!popup.classList.contains('hidden')) {
            toggleContextMenu(popup, false) // "false" means to hide the popup
        }
        }
    })
}
