import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { fromCallback } from "xstate";

type AzureSpeechEvents =
  | { type: "start" }
  | { type: "stop" }
  | { type: "hear"; result: { text: string; isFinal: boolean } }
  | { type: "turnOff" };

// Default phrases if none are in localStorage
const defaultPhrases = ["Olio", "Aron", "comma", "period"];

const azureSpeechLogic = fromCallback<AzureSpeechEvents>(
  ({ receive, sendBack }) => {
    let recognizer: SpeechSDK.SpeechRecognizer;
    let cleanup: (() => void) | null = null;

    // Handle events from the state machine
    receive(async (event) => {
      if (event.type === "start") {
        try {
          const subscriptionKey =
            localStorage.getItem("AZURE_SPEECH_KEY") || "";
          const serviceRegion =
            localStorage.getItem("AZURE_SPEECH_REGION") || "";
          const storedPhrases = localStorage.getItem("CUSTOM_PHRASES");
          const customPhrases: [string] = storedPhrases
            ? JSON.parse(storedPhrases)
            : defaultPhrases;
          console.log(customPhrases);

          if (!subscriptionKey || !serviceRegion) {
            console.error("Azure Speech credentials not found in localStorage");
            sendBack({ type: "turnOff" });
            return;
          }

          const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
            subscriptionKey,
            serviceRegion
          );
          speechConfig.speechRecognitionLanguage = "en-US";

          // Disable automatic punctuation
          speechConfig.setServiceProperty(
            "punctuation",
            "explicit",
            SpeechSDK.ServicePropertyChannel.UriQueryParameter
          );

          const audioConfig =
            SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
          recognizer = new SpeechSDK.SpeechRecognizer(
            speechConfig,
            audioConfig
          );

          // Add custom phrases
          const phraseList =
            SpeechSDK.PhraseListGrammar.fromRecognizer(recognizer);
          customPhrases.forEach((phrase) => {
            phraseList.addPhrase(phrase);
          });

          // Enable dictation mode for better transcription of natural speech
          speechConfig.enableDictation();

          // Handle continuous recognition
          recognizer.recognized = (
            _: unknown,
            e: SpeechSDK.SpeechRecognitionEventArgs
          ) => {
            if (e.result.text) {
              sendBack({
                type: "hear",
                result: { text: e.result.text, isFinal: true },
              });
            }
          };

          recognizer.recognizing = (
            _: unknown,
            e: SpeechSDK.SpeechRecognitionEventArgs
          ) => {
            if (e.result.text) {
              sendBack({
                type: "hear",
                result: { text: e.result.text, isFinal: false },
              });
            }
          };

          recognizer.canceled = (
            _: unknown,
            e: SpeechSDK.SpeechRecognitionCanceledEventArgs
          ) => {
            console.log(`CANCELED: Reason=${e.reason}`);
            sendBack({ type: "turnOff" });
          };

          recognizer.sessionStopped = () => {
            console.log("Session stopped");
            sendBack({ type: "turnOff" });
          };

          // Start continuous recognition
          await recognizer.startContinuousRecognitionAsync();

          cleanup = () => {
            if (recognizer) {
              recognizer.stopContinuousRecognitionAsync();
              recognizer.close();
            }
          };
        } catch (error) {
          console.error("Azure Speech error:", error);
          sendBack({ type: "turnOff" });
        }
      } else if (event.type === "stop") {
        cleanup?.();
        cleanup = null;
      }
    });

    // Cleanup function
    return () => {
      cleanup?.();
    };
  }
);

export { azureSpeechLogic };
