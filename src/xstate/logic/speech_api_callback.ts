import { EventObject, fromCallback } from "xstate";

export default fromCallback<EventObject, { recognition: SpeechRecognition }>(
  ({ sendBack, input: { recognition } }) => {
    recognition.onresult = (event) => {
      // https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionResultList
      // I think the results just keep piling up. Always send the most recent that's final or confident, and >= resultIndex
      // https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionEvent/resultIndex
      const len = event.results.length - 1;
      for (let i = len; i >= event.resultIndex; i--) {
        if (event.results[i].isFinal || event.results[i][0].confidence > 0.01) {
          sendBack({ type: "hear", result: event.results[i] });
          break;
        }
      }

      recognition.onend = () => sendBack({ type: "turnOff" });
      // console.log(event);
      // for (let i = 0; i < event.results.length; i++) {
      //   console.log(event.results[i]);
      // }
    }
  }
);
