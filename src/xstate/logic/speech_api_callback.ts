import { fromCallback, EventObject } from "xstate";

const speechApiLogic = fromCallback<
  EventObject,
  { recognition: SpeechRecognition }
>(({ sendBack, input: { recognition } }) => {
  console.log("speechApiLogic spawned");
  recognition.onresult = (event) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionResultList
    for (let i = 0; i < event.results.length; i++) {
      console.log(event.results[i][0].transcript);
      sendBack({ type: "hear", result: event.results[i] });
    }
  };
});

export default speechApiLogic;
