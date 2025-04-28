export { displayError }

let errorbox = document.querySelector(".errorbox")

function displayError(msg) {
  console.log(`Receieved error: ${msg}`);
  errorbox.classList.remove("hidden")
  errorbox.textContent = msg;
  setTimeout(() => {
    errorbox.classList.add("hidden");
    errorbox.textContent = "";
  }, 4500)
}