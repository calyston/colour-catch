//Global Selections and Variables

const colourDivs = document.querySelectorAll('.colour');
const refreshBtn = document.querySelector('.refresh');
const sliders = document.querySelectorAll('input[type="range"]');
const adjustBtn = document.querySelectorAll('.adjust');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
const currentHexes = document.querySelectorAll('.colour h2');
const popup = document.querySelector('.copy-container');
let initialColours;

//Event Listeners

sliders.forEach(slider => {
  slider.addEventListener('input', hslControls);
});

colourDivs.forEach((div, index) => {
  div.addEventListener('change', () => {
    updateTextUI(index);
  });
});

currentHexes.forEach(hex => {
  hex.addEventListener('click', () => {
    copyToClipboard(hex);
  })
})

//Removing the Pop up
popup.addEventListener('click', () => {
  const popupBox = popup.children[0];
  popup.classList.remove('active');
  popupBox.classList.remove('active');
});

//Adjust Button
adjustBtn.forEach((button, index) => {
  button.addEventListener('click', () => {
    openAdjustmentPanel(index);
  });
});

//Close Adjustment Panel
closeAdjustments.forEach((button, index) => {
  button.addEventListener('click', () => {
    closeAdjustmentPanel(index);
  });
});

//Functions

//Hex Generator
function generateHex() {
  const letters = '0123456789ABCDEF';
  let hash = '#';
  for (let i = 0; i < 6; i++) {
    hash += letters[Math.floor(Math.random() * 16)];
  }
  const hexColour = hash;
  return hexColour;
}

function randomColours() {
  //Initial Colours
  initialColours = [];
  colourDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColour = generateHex();
    //Add initial colour to the array
    initialColours.push(randomColour);

    //Adding the colour to the background
    div.style.backgroundColor = randomColour;
    hexText.innerText = randomColour;

    //Check for contrast
    checkTextContrast(randomColour, hexText);

    //Colourise Sliders
    const colour = chroma(randomColour);
    const sliders = div.querySelectorAll('.sliders input');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colouriseSliders(colour, hue, brightness, saturation);
  });
  //Reset Input Sliders
  resetInputs();
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colouriseSliders(colour, hue, brightness, saturation) {
  //Scale Saturation
  const noSat = colour.set('hsl.s', 0);
  const fullSat = colour.set('hsl.s', 1);
  const scaleSat = chroma.scale([noSat, colour, fullSat]);
  //Scale Brightness
  const midBright = colour.set('hsl.l', 0.5);
  const scaleBright = chroma.scale(['black', midBright, 'white']);

  //Update Input Colours
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
}

function hslControls(e) {
  const index = (e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat"));

  let sliders = e.target.parentElement.querySelectorAll('input[type = "range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColour = initialColours[index];

  let colour = chroma(bgColour)
    .set('hsl.h', hue.value)
    .set('hsl.l', brightness.value)
    .set('hsl.s', saturation.value);

  colourDivs[index].style.backgroundColor = colour;

  colouriseSliders(colour, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colourDivs[index];
  const colour = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector('h2');
  const icons = activeDiv.querySelectorAll('.controls button');
  textHex.innerText = colour.hex();
  //Check Contrast
  checkTextContrast(colour, textHex);
  for (icon of icons) {
    checkTextContrast(colour, icon);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll('.sliders input');
  sliders.forEach(slider => {
    if (slider.name === 'hue') {
      const hueColour = initialColours[slider.getAttribute('data-hue')];
      const hueValue = chroma(hueColour).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === 'saturation') {
      const satColour = initialColours[slider.getAttribute('data-sat')];
      const satValue = chroma(satColour).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
    if (slider.name === 'brightness') {
      const brightColour = initialColours[slider.getAttribute('data-bright')];
      const brightValue = chroma(brightColour).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
  })
}

function copyToClipboard(hex) {
  const element = document.createElement('textarea');
  element.value = hex.innerText;
  document.body.appendChild(element);
  element.select();
  document.execCommand('copy');
  document.body.removeChild(element);
  //Pop up Animation
  const popupBox = popup.children[0];
  popup.classList.add('active');
  popupBox.classList.add('active');
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle('active');
}

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove('active');
}

randomColours();