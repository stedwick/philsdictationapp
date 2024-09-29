import { EventObject, fromCallback } from "xstate";
import { SpeechRecognitionInterface, SpeechResultInterface } from "../types/speech_interface";

export default fromCallback<EventObject, { recognition: SpeechRecognitionInterface }>(
  ({ sendBack, input: { recognition } }) => {
    if (!recognition.WebSpeechAPI) {
      throw new Error("No Web Speech API found.");
    }
    recognition.WebSpeechAPI.onresult = (event) => {
      // https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionResultList
      // I think the results just keep piling up. Always send the most recent that's final or confident, and >= resultIndex
      // https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionEvent/resultIndex
      // FIXME: [Results] are duplicated in some browsers, like on mobile
      const len = event.results.length - 1;
      for (let i = len; i >= event.resultIndex; i--) {
        if (event.results[i].isFinal || event.results[i][0].confidence > 0.01) {
          const resultInterface: SpeechResultInterface = {
            isFinal: event.results[i].isFinal,
            transcript: event.results[i][0].transcript,
          }
          sendBack({ type: "hear", result: resultInterface });
          break;
        }
      }
    }
    recognition.WebSpeechAPI.onend = () => sendBack({ type: "turnOff" });
    // console.log(event);
    // for (let i = 0; i < event.results.length; i++) {
    //   console.log(event.results[i]);
    // }
  }
);
