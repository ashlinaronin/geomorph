let xyPad;

import { scale } from "./utils.js";

export const createUi = () => {
  xyPad = Nexus.Add.Position("#instrument", {
    size: [400, 400],
  });
};

export const play = async () => {
  // instantiate objects

  const lfo = new Tone.LFO({
    frequency: 60,
    type: "triangle",
    min: 200,
    max: 400,
  }).start();
  const oscillator1 = new Tone.FMOscillator({
    frequency: 300,
    type: "square",
    modulationType: "square",
    harmonicity: 0.6,
    modulationIndex: 13,
    volume: -4,
  }).start();
  const oscillator2 = new Tone.FMOscillator({
    frequency: 400,
    type: "triangle",
    modulationType: "sine",
    harmonicity: 3,
    modulationIndex: 8,
    volume: -4,
  }).start();
  const ampEnv = new Tone.AmplitudeEnvelope({
    attack: 0.01,
    decay: 0.5,
    sustain: 0.7,
    release: 0.5,
  });
  const freqEnv = new Tone.FrequencyEnvelope({
    attack: 0.01,
    baseFrequency: "C3",
    octaves: 2,
    exponent: 3.5,
  });
  //   const filter = new Tone.Filter(168000, "lowpass");
  const filter = new Tone.FeedbackCombFilter(0.0283, 0.65);

  const reverb = new Tone.Reverb({
    decay: 0.7,
    preDelay: 0.03,
    wet: 0.4,
  });

  // connect objects
  oscillator1.connect(ampEnv);
  oscillator2.connect(ampEnv);
  //   oscillator2.connect(oscillator1.frequency);
  //   lfo.connect(oscillator1.frequency);
  ampEnv.connect(filter);
  filter.connect(reverb);
  reverb.toDestination();

  // transport
  Tone.Transport.bpm.value = 70;
  Tone.Transport.start();

  const pattern = new Tone.Pattern(
    function (time, note) {
      oscillator1.frequency.value = note;
      freqEnv.baseFrequency = note;
      ampEnv.triggerAttackRelease("16n", time);
      freqEnv.triggerAttack();
    },
    ["C2", "D2", "E2", "A2"],
    "upDown"
  );

//   pattern.start();

  // ui
  const debouncedXyHandler = _.debounce(({ x, y }) => {
    console.log(x, y);
    const freq = scale(x, 0, 1, 100, 300);
    oscillator1.frequency.value = freq;
    freqEnv.baseFrequency = freq;
    ampEnv.triggerAttackRelease("16n");
    freqEnv.triggerAttack();
  }, 32);

  xyPad.on("change", debouncedXyHandler);
};