//Global Selections and Variables

const colourDivs = document.querySelectorAll('.colour');
const refreshBtn = document.querySelector('.refresh');
const sliders = document.querySelectorAll('.input[type="range"]');
const currentHexes = document.querySelectorAll('.colour h2');
let initialColours;

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
  colourDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColour = generateHex();

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
}

randomColours();