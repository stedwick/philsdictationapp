import { EventObject, fromCallback } from "xstate";

export default fromCallback<EventObject, { recognition: SpeechRecognition }>(
  ({ sendBack, input: { recognition } }) => {
    recognition.onresult = (event) => {
      // https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionResultList
      for (let i = 0; i < event.results.length; i++) {
        sendBack({ type: "hear", result: event.results[i] });
      }
    };
    recognition.onend = () => {
      sendBack({ type: "turnOff" });
    };
  }
);
