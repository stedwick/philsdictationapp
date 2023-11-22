import { useState, useRef, useEffect } from "react";
// import reactLogo from "./assets/react.svg";
import "./App.css";
import { Buttons } from "./components/Buttons";
import { Toaster } from "react-hot-toast";
import useNavigatorOnline from "use-navigator-online";
import { usePhilSpeech } from "./hooks/usePhilSpeech";

function App() {
  const [dictationState, setDictationState] = useState<"on" | "off" | "paused">(
    "off"
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isOnline, isOffline, backOnline, backOffline } = useNavigatorOnline();

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

        <p>
          {isOnline ? "online" : "not online"}{" "}
          {isOffline ? "offline" : "not offline"}
        </p>

        <textarea
          placeholder="Click 🎙️ Start Dictating button below..."
          className="textarea textarea-primary textarea-lg w-full my-4 flex-grow"
          ref={textareaRef}
        ></textarea>

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
