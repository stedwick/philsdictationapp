import { useState, useRef, useEffect } from "react";
// import reactLogo from "./assets/react.svg";
import "./App.css";
import { Buttons } from "./components/Buttons";
import { Toaster } from "react-hot-toast";
import { useNetworkState } from "@uidotdev/usehooks";
// import { usePrevious } from "@uidotdev/usehooks";
import { usePhilSpeech } from "./hooks/usePhilSpeech";
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/solid";
import { Wifi, WifiOff } from "lucide-react";

function App() {
  const [dictationState, setDictationState] = useState<"on" | "off" | "paused">(
    "off"
  );
  // const previousDictationState = usePrevious(dictationState);
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
  } = usePhilSpeech(dictationState, textareaRef);

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
            {!listening && (
              <div className="tooltip" data-tip="Mic off">
                <span className="badge badge-outline badge-neutral">
                  <MicrophoneIcon className="h-4 w-4"></MicrophoneIcon>
                </span>
              </div>
            )}
            {listening && (
              <div className="tooltip" data-tip="Mic listening">
                <span className="badge badge-outline badge-success">
                  <MicrophoneIcon className="h-4 w-4"></MicrophoneIcon>
                </span>
              </div>
            )}
            {!network.online && (
              <div className="tooltip" data-tip="Offline">
                <span className="badge badge-outline badge-neutral">
                  <WifiOff className="h-4 w-4" />
                </span>
              </div>
            )}
            {network.online && (
              <div className="tooltip" data-tip="Online">
                <span className="badge badge-outline badge-primary">
                  <Wifi className="h-4 w-4" />
                </span>
              </div>
            )}
          </div>
        </div>
        {!browserSupportsSpeechRecognition && (
          <div
            role="alert"
            className="alert alert-error mb-4 flex justify-center max-w-lg mx-auto"
          >
            <ExclamationCircleIcon className="h-6 w-6 shrink-0"></ExclamationCircleIcon>
            <span className="font-bold">
              Browser doesn't support speech recognition.
            </span>
          </div>
        )}
        {!isMicrophoneAvailable && (
          <div
            role="alert"
            className="alert alert-warning mb-4 flex justify-center max-w-lg mx-auto"
          >
            <ExclamationTriangleIcon className="h-6 w-6 shrink-0"></ExclamationTriangleIcon>
            <span className="font-bold">Couldn't access microphone.</span>
          </div>
        )}

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
