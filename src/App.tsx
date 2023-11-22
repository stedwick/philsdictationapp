import { useState, useRef, useEffect } from "react";
// import reactLogo from "./assets/react.svg";
import "./App.css";
import { Buttons } from "./components/Buttons";
import { Toaster } from "react-hot-toast";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import useNavigatorOnline from "use-navigator-online";

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
  } = useSpeechRecognition();
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }
  if (!isMicrophoneAvailable) {
    // Render some fallback conten
    return <span>Couldn't access microphone.</span>;
  }
  // if (browserSupportsContinuousListening) {
  //   // SpeechRecognition.startListening({ continuous: true });
  // } else {
  //   // Fallback behaviour
  // }

  useEffect(() => {
    if (dictationState == "on" && !listening) {
      SpeechRecognition.startListening();
    } else if (dictationState == "off" && listening) {
      SpeechRecognition.stopListening();
    }
  }, [dictationState, listening]);

  useEffect(() => {
    if (dictationState == "on") {
      textareaRef.current!.value += transcript;
    }
    resetTranscript();
  }, [transcript]);

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
