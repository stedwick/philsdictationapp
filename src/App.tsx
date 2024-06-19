import { useState, useRef, useEffect } from "react";
import "./App.css";
import { Buttons } from "./components/Buttons";
import { Toaster } from "react-hot-toast";
import { useNetworkState } from "@uidotdev/usehooks";
// import { usePhilSpeech } from "./hooks/usePhilSpeech";
import Indicators from "./components/Indicators";
import MicErrors from "./components/MicErrors";
import { taterMachineContext } from "./xstate/tater_context";
import subscribeToTater from "./xstate/effects/subscribe_to_tater";
import initializeTater from "./xstate/effects/initialize_tater";

function App() {
  const [dictationState, setDictationState] = useState<"on" | "off" | "paused">(
    "off"
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const network = useNetworkState();

  // Old usePhilSpeech
  //
  // const {
  //   // transcript,
  //   // interimTranscript,
  //   // finalTranscript,
  //   // resetTranscript,
  //   listening,
  //   browserSupportsSpeechRecognition,
  //   // browserSupportsContinuousListening,
  //   isMicrophoneAvailable,
  // } = usePhilSpeech(dictationState, setDictationState, textareaRef);

  // Fake
  const [listening, browserSupportsSpeechRecognition, isMicrophoneAvailable] = [
    false,
    true,
    true,
  ];

  // New XState 'Tater Machine
  const taterRef = taterMachineContext.useActorRef();
  useEffect(() => subscribeToTater(taterRef), [taterRef]); // for logging
  useEffect(() => initializeTater(taterRef), [taterRef]); // init Web Speech API

  return (
    <>
      <Toaster />
      <div
        className="container mx-auto px-4 py-4 flex flex-col"
        style={{ height: "100dvh" }}
      >
        <h1 className="text-xl text-center">
          Welcome to Phil's Dictation App!
        </h1>

        <div className="w-full my-4 flex-grow relative">
          <textarea
            id="taterTextarea"
            placeholder="Click 🎙️ Start Dictating button below..."
            className="textarea textarea-primary textarea-lg w-full h-full"
            ref={textareaRef}
          ></textarea>
          <div className="absolute bottom-2 left-0 right-0 flex justify-end space-x-2 px-2">
            <Indicators listening={listening} network={network} />
          </div>
        </div>

        <MicErrors
          isMicrophoneAvailable={isMicrophoneAvailable}
          browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
        />

        {
          <Buttons
            dictationState={dictationState}
            setDictationState={setDictationState}
            textareaRef={textareaRef}
          />
        }
      </div>
    </>
  );
}

export default App;
