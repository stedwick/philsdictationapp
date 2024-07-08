import { useNetworkState } from "@uidotdev/usehooks";
import { useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import "./App.css";
import { Buttons } from "./components/Buttons";
// import { usePhilSpeech } from "./hooks/usePhilSpeech";
import Indicators from "./components/Indicators";
import MicErrors from "./components/MicErrors";
import initializeTater from "./xstate/effects/initialize_tater";
import subscribeToTater from "./xstate/effects/subscribe_to_tater";
import { taterMachineContext } from "./xstate/tater_machine_context";

function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const network = useNetworkState();

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

        <Buttons />
      </div>
    </>
  );
}

export default App;
