import { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export function usePhilSpeech(
  // previousDictationState: string,
  dictationState: string,
  setDictationState: React.Dispatch<
    React.SetStateAction<"on" | "off" | "paused">
  >,
  textareaRef: React.RefObject<HTMLTextAreaElement>
) {
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
  // if (browserSupportsContinuousListening) {
  //   // SpeechRecognition.startListening({ continuous: true });
  // } else {
  //   // Fallback behaviour
  // }

  useEffect(() => {
    // user action
    if (dictationState != "off" && !listening) {
      SpeechRecognition.startListening({ continuous: true });
    } else if (dictationState == "off" && listening) {
      SpeechRecognition.stopListening();
    }
  }, [dictationState]);
  useEffect(() => {
    // browser action
    if (dictationState != "off" && !listening) {
      setDictationState("off");
    } else if (dictationState == "off" && listening) {
      setDictationState("on");
    }
  }, [listening]);

  useEffect(() => {
    if (dictationState == "on") {
      textareaRef.current!.value += finalTranscript;
    }
    // resetTranscript();
  }, [finalTranscript]);

  return {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
    // browserSupportsContinuousListening,
    isMicrophoneAvailable,
  };
}
