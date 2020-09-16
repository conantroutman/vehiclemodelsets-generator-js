var xmlData, xmlColors, xmlWheels;
var isLoaded = false;
var loadedFiles = 0;
var loadingTime = 1000;

function setup() {
  let i = 0;
  loadFiles();
  generateColors();
  /*setTimeout(function () {
    hideLoadingScreen();
    generateCars();
    //generateColors();
    generateMods();
    //updateOutput();
  }, loadingTime);*/
}

function loadFiles() {
  /*parseXML("data.xml", function (e) {
		xmlData = e;
		console.log("Loaded");
	});
	parseXML("colors.xml", function (e) {
		xmlColors = e;
	});
	parseXML("wheels.xml", function (e) {
		xmlWheels = e;
	});*/

  fetch("../vehicles.json")
    .then((response) => response.json())
    .then((data) => {
      generateCars(data);
    })
    .then(hideLoadingScreen());
}

function testCallback(xml) {
  //loadedFiles++;
  console.log(loadedFiles);
}

function parseXML(file, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", file, true);
  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      loadedFiles++;
      callback(this);
    }
  };
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(null);
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
  let carSelect = document.getElementById("car-select");
  let carOption = document.createElement("option");

  // Sort the vehicle list alphabetically by vehicle name
  data.vehicles.sort((a, b) => (`${a.brand} ${a.name}` > `${b.brand} ${b.name}` ? 1 : -1));

  data.vehicles.forEach((element) => {
    carOption = document.createElement("option");
    carOption.value = element.id;
    carOption.innerHTML = `${element.brand} ${element.name}`;
    carSelect.appendChild(carOption);
  });

  // Update the code output when we select a car
  carSelect.addEventListener("change", () => {
    const selectedIndex = document.getElementById("car-select").selectedIndex - 1;
    generateColors();
    generateMods(data.vehicles[selectedIndex]);
  });
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
    modOption.innerHTML = suspensions[j] + " Suspension";
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
  modLabel.innerHTML = "Wheels (" + type + ")";
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
          console.log(element.name);
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
  let modOptions = document.getElementById("mods").getElementsByTagName("select");
  let txt = "";
  //Item
  txt += "<Item>\n";
  //Name
  txt += "  <Name>" + document.getElementById("car-select").value + "</Name>\n";
  //Variations
  txt += `  <Variations type="CAmbientVehicleModelVariations">\n`;
  //BodyColours
  for (i = 1; i <= 4; i++) {
    txt += `    <BodyColour` + i + ` value="` + document.getElementById("color" + i).value + `" />\n`;
  }
  //WindowTint
  txt += `    <WindowTint value="` + document.getElementById("tint").value + `" />\n`;
  //ColourCombination
  txt += `    <ColourCombination value="-1" />\n`;
  //Livery
  txt += `    <Livery value="-1" />\n`;
  //ModKit
  txt += `    <ModKit value="0" />\n`;
  //Mods
  txt += `    <Mods>\n`;
  //Mods Items
  for (i = 0; i < modOptions.length; i++) {
    txt += `      <Item>\n`;
    txt += `        <ModType>` + modOptions[i].id + `</ModType>\n`;
    txt += `        <ModIndex value="` + modOptions[i].value + `" />\n`;
    txt += `      </Item>\n`;
  }
  txt += `    </Mods>\n`;
  //Extra
  for (i = 1; i <= 10; i++) {
    txt += `    <Extra` + i + `>CantUse</Extra` + i + `>\n`;
  }
  txt += `  </Variations>\n`;
  //Probability
  txt += `  <Probability value="1.000000" />\n`;
  txt += `</Item>`;
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
  console.log(container);
  let selects = container.getElementsByTagName("select");
  console.log(selects.length);
  for (i = 0; i < selects.length; i++) {
    selectRandom(selects[i]);
  }
  updateOutput();
}

function randomizeColors() {
  let container = document.getElementById("colors");
  console.log(container);
  let selects = container.getElementsByTagName("select");
  console.log(selects.length);
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
