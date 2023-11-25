import { useEffect, useMemo, useDeferredValue } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { TextareaUtils } from "../helpers/TextareaUtils";

export function usePhilSpeech(
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
  const textareaUtils = useMemo(
    () => new TextareaUtils(textareaRef),
    [textareaRef]
  );
  const deferredInterimTranscript = useDeferredValue(interimTranscript);

  // Controls the mic
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
      setDictationState("paused");
    }
  }, [listening]);

  // Where the magic happens
  useEffect(() => {
    if (!deferredInterimTranscript) return;
    if (dictationState == "on") {
      textareaUtils.insertAtCursor(deferredInterimTranscript, {
        selectInsertedText: true,
      });
    }
  }, [deferredInterimTranscript]);
  useEffect(() => {
    if (!finalTranscript) return;
    if (dictationState == "on") {
      textareaUtils.insertAtCursor(finalTranscript);
      resetTranscript();
    }
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
