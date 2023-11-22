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
  if (!browserSupportsSpeechRecognition) {
    // return <span>Browser doesn't support speech recognition.</span>;
  }
  if (!isMicrophoneAvailable) {
    // Render some fallback conten
    // return <span>Couldn't access microphone.</span>;
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
