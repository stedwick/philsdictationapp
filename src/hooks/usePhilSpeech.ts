import { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export function usePhilSpeech(
  previousDictationState: string,
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
    if (previousDictationState != dictationState) {
      // user action
      if (dictationState == "on" && !listening) {
        SpeechRecognition.startListening({ continuous: false });
      } else if (dictationState == "off" && listening) {
        SpeechRecognition.stopListening();
      }
    } else if (previousDictationState == dictationState) {
      // browser action
      if (dictationState == "on" && !listening) {
        setDictationState("off");
      } else if (dictationState == "off" && listening) {
        setDictationState("on");
      }
    }
  }, [dictationState, listening]);

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
