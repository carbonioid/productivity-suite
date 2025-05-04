/*
This file handles the main UI of the page, except the form. That is managed by form.js and some of its functionality is impoted here.
*/

export { registerPopup, registerEditing, setCompact, setRigidity, showOthers }
import { registerEditing } from "./form.js"
/*
These are the options and functions that add event listeners to the main container items (things *in* days and the days themselves).
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

function registerPopup(obj, type) {
  /*
  Register the correct event listeners for this object's popup (with class .popup).
  Valid types:
  hover: actives simply on hover and disappears once the mouse leaves
  rclick: actives on right click and disappears when clicking off
  */
  let popup = obj.querySelector(".popup");

  if (type === "hover") {
    obj.addEventListener('mouseenter', () => {
      popup.style.display = 'block';
    });

    obj.addEventListener('mouseleave', () => {
      popup.style.display = 'none';
    })

    obj.addEventListener('mousemove', (event) => {
      // Get the coordinates of the mouse relative to the viewport
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      setPopupPosition(popup, mouseX, mouseY);
    })
  }

  else if (type === "rclick") {
    obj.addEventListener('contextmenu', (event) => {
      event.preventDefault();

      // Toggle whether hidden
      popup.style.display = 'block';


      // Get the coordinates of the mouse relative to the viewport
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      setPopupPosition(popup, mouseX, mouseY)
    })

    document.addEventListener('click', (event) => {
      if (event.target !== popup && event.target.parent !== popup) {
        popup.style.display = 'none';
      }
    })

    document.addEventListener('contextmenu', (event) => {
      if (event.target !== popup && event.target !== obj) {
        popup.style.display = 'none';
      }
    })
  }
}

/*
These are the options and functions for the checkboxes that edit the display
of the days themselves. These are also used by run.js to make sure anything saved in these
checkboxes is taken into account on refresh. These functions are added as onclick listeners
to the checkboxes.
*/
function showOthers() {
  let obj = document.querySelector('#show-others')
  let days = Array.from(document.querySelector('.parent-container').children).slice(1); // Do not include first element
  days.forEach(day => {
    if (obj.checked) { day.classList.add("hidden"); }
    else             { day.classList.remove("hidden"); }
  })
}

document.querySelector('#show-others').addEventListener('click', (event) => { showOthers(); })

function setCompact(obj) {
  let compact = document.querySelector('#compact-mode').checked
  if (compact) { obj.classList.remove("padded-container"); }
  else             { obj.classList.add("padded-container"); }
}

document.querySelector('#compact-mode').addEventListener('click', (event) => {
  let days = Array.from(document.querySelector('.parent-container').children);
  days.forEach(day => setCompact(day))
})

function setRigidity(obj) {
  let rigid = document.querySelector('#rigid-mode').checked
  Array.from(obj.children).forEach(item => {
    if (item.classList.contains("pad-item")) { // We only do this for padding items
      if (rigid) { item.classList.remove("hidden"); }
      else { item.classList.add("hidden"); }
    }
  })
}

document.querySelector('#rigid-mode').addEventListener('click', (event) => {
  let days = Array.from(document.querySelector('.parent-container').children); // Do not include last element
  days.forEach(day => setRigidity(day))
})
