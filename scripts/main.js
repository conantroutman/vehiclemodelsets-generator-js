let jsonData;
let timeout;
const carSelect = document.getElementById("car-select");
const filterInput = document.querySelector('#car-filter');

function setup() {
  filterInput.value = '';
  loadFiles();
  generateColors();
}

function loadFiles() {

  fetch("../vehicles.json")
    .then((response) => response.json())
    .then((data) => {
      jsonData = data;
      generateCars(data);
    })
    .then(hideLoadingScreen());
}

//--------------------------------------------------------------------------------------------------------------------------
// generateColors - Generates drop-down lists for color selection.
//--------------------------------------------------------------------------------------------------------------------------
function generateColors() {
  fetch("../colors.json")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("colors").innerHTML = "";
      let i, colorSelect;
      for (i = 0; i < 4; i++) {
        colorLabel = document.createElement("label");
        switch (i) {
          case 0:
            colorLabel.innerHTML = "Primary Color";
            break;
          case 1:
            colorLabel.innerHTML = "Secondary Color";
            break;
          case 2:
            colorLabel.innerHTML = "Pearlescent Color";
            break;
          case 3:
            colorLabel.innerHTML = "Wheel Color";
            break;
        }

        colorSelect = document.createElement("select");
        colorSelect.id = "color" + (i + 1);
        colorSelect.className = "form-control";

        color = document.createElement("option");
        color.value = -1;
        color.selected = true;
        color.text = "Default";
        colorSelect.appendChild(color);

        data.colors.forEach((element) => {
          color = document.createElement("option");
          color.value = element.id;
          color.style.backgroundColor = `rgb(${element.rgb})`;
          color.style.color = GetContrastingTextColor(element.rgb);
          color.innerHTML = element.name;
          colorSelect.appendChild(color);
        });

        colorSelect.addEventListener("change", updateOutput);
        document.getElementById("colors").appendChild(colorLabel);
        document.getElementById("colors").appendChild(colorSelect);
      }

      generateWindowTint();

      document.getElementById("colors").appendChild(createButton("Randomize", "randomize-mods", "primary", randomizeColors));
    });
}

function generateWindowTint() {
  let tint;
  const tints = ["None", "Light Smoke", "Dark Smoke", "Limo"];

  const tintLabel = document.createElement("label");
  tintLabel.innerHTML = "Window Tint";

  const tintSelect = document.createElement("select");
  tintSelect.className = "form-control";
  tintSelect.id = "tint";

  for (i = 0; i < 4; i++) {
    tint = document.createElement("option");
    tint.value = i - 1;
    tint.innerHTML = tints[i];
    tintSelect.appendChild(tint);
  }
  tintSelect.addEventListener("change", updateOutput);
  document.getElementById("colors").appendChild(tintLabel);
  document.getElementById("colors").appendChild(tintSelect);
}

//--------------------------------------------------------------------------------------------------------------------------
// generateCars - Generates a drop-down list for car selection.
//--------------------------------------------------------------------------------------------------------------------------
function generateCars(data) {
  let carOption = document.createElement("option");

  // Sort the vehicle list alphabetically by vehicle name
  data.vehicles.sort((a, b) => (`${a.brand} ${a.name}` > `${b.brand} ${b.name}` ? 1 : -1));

  // Generate HTML option elements for each vehicle
  data.vehicles.forEach((element) => {
    carOption = document.createElement("option");
    carOption.value = element.id;
    carOption.innerHTML = `${element.brand} ${element.name}`;
    carSelect.appendChild(carOption);
  });

  // Update the code output when we select a car
  carSelect.addEventListener("input", () => {
    // Debouncing stuff
    if (timeout) {
      window.cancelAnimationFrame(timeout);
    }

    timeout = window.requestAnimationFrame(() => {

      // Actual code is here, after debouncing
      let selectedIndex = 0;

      jsonData.vehicles.forEach((element, index) => {
        if (element.id === carSelect.value) selectedIndex = index;
      });
  
      generateColors();
      generateMods(jsonData.vehicles[selectedIndex]);
    });
  }, false);
}

//--------------------------------------------------------------------------------------------------------------------------
// generateInputFields - Generates drop-down lists for mod selection.
//--------------------------------------------------------------------------------------------------------------------------
function generateMods(vehicle) {
  console.log(vehicle);
  document.getElementById("mods").innerHTML = "";
  let label, select, option;

  vehicle.mods.forEach((element) => {
    label = document.createElement("label");
    label.innerHTML = element.name;
    select = document.createElement("select");
    select.className = "form-control";
    select.id = element.type;
    //select.className = "form-control";
    select.addEventListener("change", updateOutput);
    document.getElementById("mods").appendChild(label);
    document.getElementById("mods").appendChild(select);

    element.variants.forEach((variant, index) => {
      option = document.createElement("option");
      option.value = index - 1;
      option.text = variant;
      select.add(option);
    });
  });

  generateWheels(vehicle.wheels, generateGenericInputFields);

  updateOutput();
}

//--------------------------------------------------------------------------------------------------------------------------
// generateGenericInputFields - Generates drop-down lists for generic/shared mod categories, such as suspension, wheels, etc.
//--------------------------------------------------------------------------------------------------------------------------
function generateGenericInputFields() {
  let suspensions = ["Stock", "Lowered", "Street", "Sport", "Competition"];
  let modOption;

  //console.log(i);
  let modLabel = document.createElement("label");
  let modSelect = document.createElement("select");
  modLabel.innerHTML = "Suspension";
  modSelect.className = "form-control";
  modSelect.id = "VMT_SUSPENSION";
  for (j = 0; j < 5; j++) {
    modOption = document.createElement("option");
    modOption.innerHTML = `${suspensions[j]} Suspension`;
    modOption.value = j - 1;
    modSelect.appendChild(modOption);

    modSelect.addEventListener("change", updateOutput);
    document.getElementById("mods").appendChild(modLabel);
    document.getElementById("mods").appendChild(modSelect);
  }

  if (document.getElementById("mods").getElementsByTagName("select").length > 0) {
    document.getElementById("mods").appendChild(createButton("Randomize", "randomize-mods", "primary", randomizeMods));
  }
}

function generateWheels(type, callback) {
  let modLabel = document.createElement("label");
  let modSelect = document.createElement("select");
  modLabel.innerHTML = `Wheels (${type})`;
  modSelect.className = "form-control";
  modSelect.id = "VMT_WHEELS";
  modOption = document.createElement("option");
  modOption.innerHTML = "Stock";
  modOption.value = -1;
  modSelect.add(modOption);

  fetch("../wheels.json")
    .then((response) => response.json())
    .then((data) => {
      data.wheels.forEach((element) => {
        if (element.name == type) {
          //console.log(element.name);
          element.variants.forEach((wheel, index) => {
            modOption = document.createElement("option");
            modOption.value = index;
            modOption.text = wheel;
            modSelect.add(modOption);
          });
        }
      });
      modSelect.addEventListener("change", updateOutput);
      document.getElementById("mods").appendChild(modLabel);
      document.getElementById("mods").appendChild(modSelect);
      callback();
    });
}

//Update/print the output code
function updateOutput() {
  const modOptions = Array.from(document.querySelector("#mods").querySelectorAll("select"));
  const txt = `<Item>
    <Name>${document.querySelector("#car-select").value}</Name>
    <Variations type="CAmbientVehicleModelVariations">
      <BodyColour1 value="${document.querySelector("#color1").value}" />
      <BodyColour2 value="${document.querySelector("#color2").value}" />
      <BodyColour3 value="${document.querySelector("#color3").value}" />
      <BodyColour4 value="${document.querySelector("#color4").value}" />
      <WindowTint value="${document.querySelector("#tint").value}" />
      <ColourCombination value="-1" />
      <Livery value="-1" />
      <ModKit value="0" />
      <Mods>
        ${modOptions.map((mod) => 
          `<Item>
            <ModType>${mod.id}</ModType>
            <ModIndex value="${mod.value}" />
          </Item>`
        ).join('\n          ')}
      </Mods>
      <Extra1>CantUse</Extra1>
      <Extra2>CantUse</Extra2>
      <Extra3>CantUse</Extra3>
      <Extra4>CantUse</Extra4>
      <Extra5>CantUse</Extra5>
      <Extra6>CantUse</Extra6>
      <Extra7>CantUse</Extra7>
      <Extra8>CantUse</Extra8>
      <Extra9>CantUse</Extra9>
      <Extra10>CantUse</Extra10>
    </Variations>
    <Probability value="1.000000" />
  </Item>`;
  document.getElementById("output").innerHTML = txt;
}

//Select a random option in a select element.
function selectRandom(select) {
  let items = select.getElementsByTagName("option");
  let index = Math.floor(Math.random() * items.length);
  select.selectedIndex = index;
}

function randomizeMods() {
  let container = document.getElementById("mods");
  //console.log(container);
  let selects = container.getElementsByTagName("select");
  //console.log(selects.length);
  for (i = 0; i < selects.length; i++) {
    selectRandom(selects[i]);
  }
  updateOutput();
}

function randomizeColors() {
  let container = document.getElementById("colors");
  //console.log(container);
  let selects = container.getElementsByTagName("select");
  //console.log(selects.length);
  for (i = 0; i < selects.length; i++) {
    selectRandom(selects[i]);
  }
  updateOutput();
}

function copyOutput() {
  let output = document.getElementById("output");
  output.select();
  document.execCommand("copy");
}

function createButton(text, id, type, onclick) {
  let button = document.createElement("button");
  button.innerHTML = text;
  button.id = id;
  button.className = "btn btn-" + type;
  button.addEventListener("click", onclick);
  return button;
}

function hideLoadingScreen() {
  document.getElementsByClassName("loadingscreen")[0].style.display = "none";
}

function cardNavigate(id) {
  let car = document.getElementById("car");
  let colors = document.getElementById("colors");
  let mods = document.getElementById("mods");
  let prevId = document.getElementsByClassName("active")[0];
  prevId.classList.remove("active");
  document.getElementById(id).classList.add("active");

  switch (id) {
    case "nav-1":
      car.style.display = "block";
      colors.style.display = "none";
      mods.style.display = "none";
      break;
    case "nav-2":
      car.style.display = "none";
      colors.style.display = "block";
      mods.style.display = "none";
      break;
    case "nav-3":
      car.style.display = "none";
      colors.style.display = "none";
      mods.style.display = "block";
      break;
  }
}

function reset() {
  const inputs = Array.from(document.querySelector("#mods").querySelectorAll("select"));
  inputs.forEach((input) => {
    input.value = '-1';
  });
  updateOutput();
}

//--------------------------------------------------------------------------------------------------------------------------
// Filter the car selection dropdown
//--------------------------------------------------------------------------------------------------------------------------
filterInput.addEventListener('input', filterCars);

function filterCars() {
  console.log("Firing event")

  if (filterInput.value.length > 0) {

    const filter = filterInput.value;
    //console.log(filter)
    let filteredVehicles = {vehicles: []}

    // Look through the complete list of vehicles and pick out the ones with matching name/brand and add to the filtered list
    jsonData.vehicles.forEach((element) => {
      if (element.name.toLowerCase().includes(filter.toLowerCase()) || element.brand.toLowerCase().includes(filter.toLowerCase())) {
        filteredVehicles.vehicles.push(element);
      }
    });

    carSelect.innerHTML = '';
    generateCars(filteredVehicles)

    //console.log(jsonData);
  }
  // Reset the filter if the filter input is empty
  else if (filterInput.value.length == 0) {
    carSelect.innerHTML = '';
    generateCars(jsonData);
  }
}

//--------------------------------------------------------------------------------------------------------------------------
// GetContrastingTextColor - Selects white or black text depending on background color https://stackoverflow.com/questions/11867545/change-text-color-based-on-brightness-of-the-covered-background-area
//--------------------------------------------------------------------------------------------------------------------------

function GetContrastingTextColor(rgbString) {
  const rgb = rgbString.split(', ');

  const brightness = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000);
  const textColor = (brightness > 125) ? 'black' : 'white';

  return textColor;
}