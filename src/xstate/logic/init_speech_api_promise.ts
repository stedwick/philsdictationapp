import { fromPromise } from "xstate";

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
export default fromPromise(async function() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  // const SpeechGrammarList =
  //   window.SpeechGrammarList || window.webkitSpeechGrammarList;
  // const SpeechRecognitionEvent =
  // window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

  // const colors = [
  //   "Santa", // HARD custom words
  //   "aqua",
  //   "azure",
  //   "beige",
  //   "bisque",
  //   "black",
  //   "blue",
  //   "brown",
  //   "chocolate",
  //   "coral" /* … */,
  // ];
  // const grammar = `#JSGF V1.0; grammar colors; public <color> = ${colors.join(
  //   " | "
  // )};`;

  const recognition = new SpeechRecognition();
  // const speechRecognitionList = new SpeechGrammarList();
  // speechRecognitionList.addFromString(grammar, 1);
  // recognition.grammars = speechRecognitionList;

  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.maxAlternatives = 5;

  return recognition;
});
