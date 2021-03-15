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

randomColours();