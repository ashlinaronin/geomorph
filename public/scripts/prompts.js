import prompts from "./prompts-data.js";

let currentSynth = null;

const getRandomPrompt = () =>
  prompts[Math.floor(Math.random() * prompts.length)];

export const loadSynth = async (synthName) => {
  currentSynth?.dispose();
  currentSynth = null;
  currentSynth = await import(`./synths/${synthName}.js`);
  await currentSynth.createUi();
  await currentSynth.play();
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

export const getImageSrc = (imageIndex) => {
  const adjustedIndex = (imageIndex + 1).toString().padStart(2, "0");
  return `./images/geomorph_${adjustedIndex}.jpg`;
};

export const showImage = (imageIndex) => {
  document.getElementById("score-image").src = getImageSrc(imageIndex);
};
