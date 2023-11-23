import { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export function usePhilSpeech(
  dictationState: string,
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
    if (dictationState == "on" && !listening) {
      SpeechRecognition.startListening({ continuous: true });
    } else if (dictationState == "off" && listening) {
      SpeechRecognition.stopListening();
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
