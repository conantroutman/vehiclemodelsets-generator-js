var xmlData;

function setup() {
  parseXML("data.xml", generateCars);
  parseXML("colors.xml", generateColors);
  generateWindowTint();
  updateOutput();
}

function parseXML(file, callback) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", file, true);
  xhttp.onload = function() {
    //xmlData = this;
    callback(this);
  };
  xhttp.send();
}

//--------------------------------------------------------------------------------------------------------------------------
// generateColors - Generates drop-down lists for color selection.
//--------------------------------------------------------------------------------------------------------------------------
function generateColors(xml) {
  let x, i, xmlDoc, colorSelect;
  xmlDoc = xml.responseXML;
  x = xmlDoc.getElementsByTagName("color");
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
    for (j = 0; j < x.length; j++) {
      color = document.createElement("option");
      color.value = x[j].getAttribute("id");
      color.style.backgroundColor = "rgb(" + x[j].getAttribute("rgb") + ")";
      color.innerHTML = x[j].getAttribute("name");
      colorSelect.appendChild(color);
    }
    colorSelect.addEventListener("change", updateOutput);
    document.getElementById("colors").appendChild(colorLabel);
    document.getElementById("colors").appendChild(colorSelect);
  }
}

function generateWindowTint() {
  let tint;
  let tints = ["None", "Light Smoke", "Dark Smoke", "Limo"];
  let tintLabel = document.createElement("label");
  tintLabel.innerHTML = "Window Tint";
  let tintSelect = document.createElement("select");
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
function generateCars(xml) {
  let x, i, xmlDoc;
  let cars = new Array();
  xmlDoc = xml.responseXML;
  let carSelect = document.getElementById("car-select");
  let carOption = document.createElement("option");
  x = xmlDoc.getElementsByTagName("car");
  for (i = 0; i < x.length; i++) {
    cars.push({
      id: x[i].getAttribute("id"),
      name: x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue
    });
  }

  // Sort the vehicle list alphabetically by vehicle name
  cars.sort((a, b) => (a.name > b.name ? 1 : -1));

  for (i = 0; i < x.length; i++) {
    carOption = document.createElement("option");
    carOption.value = cars[i].id;
    carOption.innerHTML = cars[i].name;
    carSelect.appendChild(carOption);
  }

  // Update the code output when we select a car
  carSelect.addEventListener("change", function() {
    parseXML("data.xml", generateInputFields);
  });
  console.log(cars);
  //document.getElementById("demo").appendChild(carSelect);
}

//--------------------------------------------------------------------------------------------------------------------------
// generateInputFields - Generates drop-down lists for mod selection.
//--------------------------------------------------------------------------------------------------------------------------
function generateInputFields(xml) {
  document.getElementById("mods").innerHTML = "";
  let pos;
  let car = document.getElementById("car-select").value;
  let x = xml.responseXML.getElementsByTagName("car");
  let label, select, option;

  //Find the selected car in the XML
  for (i = 0; i < x.length; i++) {
    if (x[i].getAttribute("id") == car) {
      pos = x[i].getElementsByTagName("mods")[0].getElementsByTagName("mod");
      break;
    }
  }

  //List all available mod categories
  for (i = 0; i < pos.length; i++) {
    var variants = pos[i].childNodes[1].getElementsByTagName("variant");
    label = document.createElement("label");
    label.innerHTML = pos[i].getAttribute("name");
    select = document.createElement("select");
    select.id = pos[i].getAttribute("type");
    //select.className = "form-control";
    select.addEventListener("change", updateOutput);
    document.getElementById("mods").appendChild(label);
    document.getElementById("mods").appendChild(select);

    for (j = 0; j < variants.length; j++) {
      option = document.createElement("option");
      option.value = j - 1;
      option.text = variants[j].getAttribute("name");
      select.add(option);
    }
  }

  generateGenericInputFields(xml);
  button = document.createElement("button");
  button.className = "btn btn-primary";
  button.innerHTML = "Randomize";
  button.addEventListener("click", randomizeOptions);
  document.getElementById("mods").appendChild(button);

  updateOutput();
}

//--------------------------------------------------------------------------------------------------------------------------
// generateGenericInputFields - Generates drop-down lists for generic/shared mod categories, such as suspension, wheels, etc.
//--------------------------------------------------------------------------------------------------------------------------
function generateGenericInputFields(xml) {
  let suspensions = ["Stock", "Lowered", "Street", "Sport", "Competition"];
  let modSelect, modLabel, modOption;
  for (i = 0; i < 2; i++) {
    //console.log(i);
    modLabel = document.createElement("label");
    modSelect = document.createElement("select");
    switch (i) {
      case 0:
        modLabel.innerHTML = "Wheels";
        modSelect.id = "VMT_WHEELS";
        break;
      case 1:
        modLabel.innerHTML = "Suspension";
        modSelect.id = "VMT_SUSPENSION";
        for (j = 0; j < 5; j++) {
          modOption = document.createElement("option");
          modOption.innerHTML = suspensions[j] + " Suspension";
          modOption.value = j - 1;
          modSelect.appendChild(modOption);
        }
        break;
    }
    modSelect.addEventListener("change", updateOutput);
    document.getElementById("mods").appendChild(modLabel);
    document.getElementById("mods").appendChild(modSelect);
  }
}

//Update/print the output code
function updateOutput() {
  let modOptions = document
    .getElementById("mods")
    .getElementsByTagName("select");
  let txt = "";
  //Item
  txt += "<Item>\n";
  //Name
  txt +=
    "    <Name>" + document.getElementById("car-select").value + "</Name>\n";
  //Variations
  txt += `    <Variations type="CAmbientVehicleModelVariations">\n`;
  //BodyColours
  for (i = 1; i <= 4; i++) {
    txt +=
      `        <BodyColour` +
      i +
      ` value="` +
      document.getElementById("color" + i).value +
      `" />\n`;
  }
  //WindowTint
  txt +=
    `        <WindowTint value="` +
    document.getElementById("tint").value +
    `" />\n`;
  //ColourCombination
  txt += `        <ColourCombination value="-1" />\n`;
  //Livery
  txt += `        <Livery value="-1" />\n`;
  //ModKit
  txt += `        <ModKit value="0" />\n`;
  //Mods
  txt += `            <Mods>\n`;
  //Mods Items
  for (i = 0; i < modOptions.length; i++) {
    txt += `                <Item>\n`;
    txt += `                    <ModType>` + modOptions[i].id + `</ModType>\n`;
    txt +=
      `                    <ModIndex>` + modOptions[i].value + `</ModIndex>\n`;
    txt += `                </Item>\n`;
  }
  txt += `            </Mods>\n`;
  //Extra
  for (i = 1; i <= 10; i++) {
    txt += `        <Extra` + i + `>CantUse</Extra` + i + `>\n`;
  }
  txt += `    </Variations>\n`;
  //Probability
  txt += `    <Probability value="1.000000" />\n`;
  txt += `</Item>`;
  document.getElementById("output").innerHTML = txt;
}

//Select a random option in a select element.
function selectRandom(select) {
  let items = select.getElementsByTagName("option");
  let index = Math.floor(Math.random() * items.length);
  select.selectedIndex = index;
}

function randomizeOptions() {
  let container = document.getElementById("mods");
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
