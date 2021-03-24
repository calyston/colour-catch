//Global Selections and Variables

const colourDivs = document.querySelectorAll('.colour');
const refreshBtn = document.querySelector('.refresh');
const sliders = document.querySelectorAll('input[type="range"]');
const adjustBtn = document.querySelectorAll('.adjust');
const lockBtn = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
const currentHexes = document.querySelectorAll('.colour h2');
const popup = document.querySelector('.copy-container');
let initialColours;

//Local Storage
let savedPalettes = [];

//Event Listeners

refreshBtn.addEventListener('click', randomColours);

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

//Lock Button
lockBtn.forEach((button, index) => {
  button.addEventListener('click', () => {
    addLockClass(button, index);
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

function addLockClass(button, index) {
  colourDivs[index].classList.toggle('locked');
  lockBtn[index].firstChild.classList.toggle('fa-lock-open');
  lockBtn[index].firstChild.classList.toggle('fa-lock');
}

function randomColours() {
  //Initial Colours
  initialColours = [];
  colourDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColour = generateHex();
    //Add initial colour to the array
    if (div.classList.contains('locked')) {
      initialColours.push(hexText.innerText);
      return;
    } else {
      initialColours.push(randomColour);
    }

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

  //Check for icon contrast
  adjustBtn.forEach((button, index) => {
    checkTextContrast(initialColours[index], button);
    checkTextContrast(initialColours[index], lockBtn[index]);
  });
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

//Save Palette & Local Storage
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-name');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

//Event Listeners
saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add('active');
  popup.classList.add('active');
}

function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove('active');
  popup.classList.remove('active');
}

function savePalette(e) {
  saveContainer.classList.remove('active');
  popup.classList.remove('active');
  const name = saveInput.value;
  const colours = [];
  currentHexes.forEach(hex => {
    colours.push(hex.innerText);
  });

  //Generate Object
  let paletteNr = savedPalettes.length;
  const paletteObject = { name, colours, nr: paletteNr };
  savedPalettes.push(paletteObject);
  //Save to Local Storage
  savetoLocal(paletteObject);
  saveInput.value = '';
  //Generate the palette for the library
  const palette = document.createElement('div');
  palette.classList.add('custom-palette');
  const title = document.createElement('h4');
  title.innerText = paletteObject.name;
  const preview = document.createElement('div');
  preview.classList.add('small-preview');
  paletteObject.colours.forEach(smallColour => {
    const smallDiv = document.createElement('div');
    smallDiv.style.backgroundColor = smallColour;
    preview.appendChild(smallDiv);
  });

  const paletteBtn = document.createElement('button');
  paletteBtn.classList.add('pick-palette-button');
  paletteBtn.classList.add(paletteObject.nr);
  paletteBtn.innerText = 'Select';

  //Event Listener
  paletteBtn.addEventListener('click', e => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColours = [];
    savedPalettes[paletteIndex].colours.forEach((colour, index) => {
      initialColours.push(colour);
      colourDivs[index].style.backgroundColor = colour;
      const text = colourDivs[index].children[0];
      checkTextContrast(colour, text);
      updateTextUI(index);
    });
    resetInputs();
  })

  //Append to Library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
}

function savetoLocal(paletteObject) {
  let localPalettes;
  if (localStorage.getItem('palettes') === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem('palettes'));
  }
  localPalettes.push(paletteObject);
  localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add('active');
  popup.classList.add('active');
}

function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove('active');
  popup.classList.remove('active');
}

function getLocal() {
  if (localStorage.getItem('palettes') === null) {
    localStorage = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    paletteObjects.forEach(paletteObject => {
      //Generate the palette for the library
      const palette = document.createElement('div');
      palette.classList.add('custom-palette');
      const title = document.createElement('h4');
      title.innerText = paletteObject.name;
      const preview = document.createElement('div');
      preview.classList.add('small-preview');
      paletteObject.colours.forEach(smallColour => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColour;
        preview.appendChild(smallDiv);
      });

      const paletteBtn = document.createElement('button');
      paletteBtn.classList.add('pick-palette-button');
      paletteBtn.classList.add(paletteObject.nr);
      paletteBtn.innerText = 'Select';

      //Event Listener
      paletteBtn.addEventListener('click', e => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColours = [];
        savedPalettes[paletteIndex].colours.forEach((colour, index) => {
          initialColours.push(colour);
          colourDivs[index].style.backgroundColor = colour;
          const text = colourDivs[index].children[0];
          checkTextContrast(colour, text);
          updateTextUI(index);
        });
        resetInputs();
      });
      //Append to Library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(palette);
    });
  }
}

getLocal();
randomColours();