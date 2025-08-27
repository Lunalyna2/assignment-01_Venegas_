//grab input, message, output, and loading gif from html
const numInput = document.getElementById('numInput');
const message = document.getElementById('message');
const output = document.getElementById('output');
const loadGif = document.getElementById('loadGif');

//store users and track if we show first or last name
let pastUsers = [];
let nameMode = 'first';

//function to call randomuser api and get random users
async function fetchRandomUsers(num) {
  let response;
  try {
    //fetch from the api
    response = await fetch(`https://randomuser.me/api/?results=${num}`);
  } catch (error) {
    //no wifi or internet
    throw new Error("You have no internet, try again: " + error.message);
  }

  //check if the response is okay
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  let data;
  try {
    //convert to json
    data = await response.json();
  } catch (error) {
    throw new Error("Invalid JSON response from API.");
  }

  //if nothing came back
  if (!data.results || data.results.length === 0) {
    throw new Error("No users returned from API");
  }
  return data.results;
}

//function that shows users on the page
function displayUsers(users) {
  //clear old stuff
  output.innerHTML = '';

  //header row with the titles
  const headerRow = document.createElement('div');
  headerRow.className = 'header-row';
  headerRow.innerHTML = `
    <select id="nameMode" class="form-select header-pill border-0 text-center" style="width:auto;">
      <option value="first" ${nameMode === "first" ? "selected" : ""}>First Name</option>
      <option value="last" ${nameMode === "last" ? "selected" : ""}>Last Name</option>
    </select>
    <div class="header-pill">Gender</div>
    <div class="header-pill col-email">Email</div>
    <div class="header-pill">Country</div>
  `;
  output.appendChild(headerRow);

  //add each user row 
  users.forEach(user => {
    const name = nameMode === 'first' ? user.name.first : user.name.last;

    //make a new row
    const userRow = document.createElement('div');
    userRow.className = 'user-row';
    userRow.innerHTML = `
      <div class="user-pill">${name}</div>
      <div class="user-pill">${user.gender}</div>
      <div class="user-pill col-email">${user.email}</div>
      <div class="user-pill">${user.location.country}</div>
    `;
    output.appendChild(userRow);
  });

  //dropdown listener (only adds one time) 
  const nameModeSelect = document.getElementById('nameMode');
  if (!nameModeSelect.dataset.listener) {
    nameModeSelect.addEventListener('change', e => {
      nameMode = e.target.value; //switch between first/last
      displayUsers(pastUsers);   //reload users with new name mode
    });
    nameModeSelect.dataset.listener = 'true';
  }
}

//when someone presses enter inside the input box
numInput.addEventListener('keyup', async e => {
  if (e.key === 'Enter') {
    const num = parseInt(numInput.value);

    //check if number is valid
    if (isNaN(num) || num < 1 || num > 1000) {
      message.textContent = 'Please enter a number between 1 and 1000.';
      return;
    }

    //show loading cat gif
    message.textContent = '';
    loadGif.style.display = 'block';

    try {
      //fetch the users and display them
      pastUsers = await fetchRandomUsers(num);
      displayUsers(pastUsers);
    } catch (error) {
      //if something went wrong
      message.textContent = "Failed to load random users: " + error.message;
    }

    //hide loading gif
    loadGif.style.display = 'none';
  }
});

//show header
displayUsers([]);
