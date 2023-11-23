import { useState, useRef, useEffect } from "react";
// import reactLogo from "./assets/react.svg";
import "./App.css";
import { Buttons } from "./components/Buttons";
import { Toaster } from "react-hot-toast";
import { useNetworkState } from "@uidotdev/usehooks";
import { usePrevious } from "@uidotdev/usehooks";
import { usePhilSpeech } from "./hooks/usePhilSpeech";
import Indicators from "./components/Indicators";
import MicErrors from "./components/MicErrors";

function App() {
  const [dictationState, setDictationState] = useState<"on" | "off" | "paused">(
    "off"
  );
  const previousDictationState = usePrevious(dictationState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const network = useNetworkState();

  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
    // browserSupportsContinuousListening,
    isMicrophoneAvailable,
  } = usePhilSpeech(
    previousDictationState,
    dictationState,
    setDictationState,
    textareaRef
  );

  useEffect(() => {
    console.log({ transcript, interimTranscript, finalTranscript });
  }, [transcript, interimTranscript, finalTranscript]);

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
