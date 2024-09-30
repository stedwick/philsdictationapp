import { EventObject, fromCallback } from "xstate";
import { SpeechRecognitionInterface, SpeechResultInterface } from "../types/speech_interface";

export default fromCallback<EventObject, { recognition: SpeechRecognitionInterface }>(
  ({ sendBack, input: { recognition } }) => {
    if (!recognition.AssemblyAI) {
      throw new Error("No AssemblyAI found.");
    }
    recognition.AssemblyAI.on('transcript', transcript => {
      const isFinal = transcript.message_type === "FinalTranscript";
      const resultInterface: SpeechResultInterface = {
        isFinal,
        transcript: transcript.text,
      }
      sendBack({ type: "hear", result: resultInterface });
    });

    recognition.AssemblyAI.on('close', (code, reason) => {
      console.log(`Connection closed: ${code} ${reason}`);
      sendBack({ type: "turnOff" });
    });

    recognition.AssemblyAI.on('error', event => {
      console.error(event);
      recognition.AssemblyAI!.close();
    });
  }
);
