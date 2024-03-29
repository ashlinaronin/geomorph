import prompts from "./prompts-data.js";
import IMAGE_SEQUENCE from "./image-sequence.mjs";

let currentSynth = null;

const getRandomPrompt = () =>
  prompts[Math.floor(Math.random() * prompts.length)];

export const loadSynth = async (synthName) => {
  currentSynth?.dispose();
  currentSynth = null;

  let synthConstructor = (await import(`./synths/${synthName}.js`)).default;
  currentSynth = synthConstructor();
  currentSynth.createUi();
  currentSynth.play();
};

export const showRandomPrompt = () => {
  currentSynth?.dispose();
  currentSynth = null;

  const prompt = getRandomPrompt();

  document.getElementById(
    "prompt-header"
  ).innerText = `${prompt.type} (${prompt.speed})`;
  document.getElementById("prompt-text").innerText = prompt.text;

  if (prompt.type === "ice") {
    console.log("use grainfields, not loading a synth...");
    return;
  }

  if (prompt.type !== "none") {
    loadSynth(prompt.type);
  }
};

// based on the provided IMAGE_SEQUENCE and which image we're on,
// find the appropriate image file src
export const getImageSrc = (imageIndex) => {
  const sequenceImageIndex = IMAGE_SEQUENCE[imageIndex];

  const adjustedIndex = sequenceImageIndex.toString().padStart(2, "0");
  return `./images/geomorph_${adjustedIndex}.jpg`;
};

export const preloadImages = () => {
  for (let i = 0; i < IMAGE_SEQUENCE.length; i++) {
    const img = new Image();
    img.src = getImageSrc(i);
  }
};

export const wait = async (ms) =>
  new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve();
      clearTimeout(timeout);
    }, ms);
  });

export const showImage = async (imageIndex) => {
  const container = document.getElementById("score-image-container");
  const [currentImage, nextImage] = container.getElementsByTagName("img");

  nextImage.src = getImageSrc(imageIndex);
  console.log("currentImageSrc", currentImage.src);
  console.log("nextImageSrc", nextImage.src);

  currentImage.style.opacity = 0;

  await wait(1000);
  nextImage.style.opacity = 1;

  // after fade, swap next w/ current so we're ready for the next transition
  await wait(1000);
  container.appendChild(currentImage);
};

export const fadeOutImage = async () => {
  const currentImg = document.querySelector(
    "#score-image-container img:first-of-type"
  );
  // update transition for fade out, then set it back after we're done
  currentImg.style.transition = "opacity 4s";
  currentImg.style.opacity = 0;
  await wait(4000);
  currentImg.style.transition = "opacity 1s";
};
