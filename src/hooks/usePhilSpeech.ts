import { useEffect, useMemo, useDeferredValue, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { TextareaUtils } from "../helpers/TextareaUtils";
import { generateCommands } from "../helpers/commands";

export function usePhilSpeech(
  dictationState: string,
  setDictationState: React.Dispatch<
    React.SetStateAction<"on" | "off" | "paused">
  >,
  textareaRef: React.RefObject<HTMLTextAreaElement>
) {
  const textareaUtils = useMemo(
    () => new TextareaUtils(textareaRef),
    [textareaRef]
  );
  const dictationStateRef = useRef(dictationState);
  useEffect(() => {
    dictationStateRef.current = dictationState;
  }, [dictationState]);
  const commands = useMemo(
    () =>
      generateCommands({
        textareaUtils,
        dictationStateRef,
        setDictationState,
      }),
    [textareaUtils, dictationStateRef, setDictationState]
  );
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
    // browserSupportsContinuousListening,
    isMicrophoneAvailable,
  } = useSpeechRecognition({ commands });
  const deferredInterimTranscript = useDeferredValue(interimTranscript);
  const lastSpokenAtRef = useRef(Date.now());

  // setInterval for sleep/off
  useEffect(() => {
    const intervalId = setInterval(() => {
      const timeDiff = Date.now() - lastSpokenAtRef.current;
      if (timeDiff > 30 * 1000) {
        setDictationState((dictationState) =>
          dictationState != "off" ? "paused" : dictationState
        );
      }
      if (timeDiff > 5 * 60 * 1000) {
        setDictationState("off");
      }
    }, 10 * 1000);

    return () => clearInterval(intervalId); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, []);

  // Rudimentary auto-mic based on window Focus gained and lost.
  useEffect(() => {
    window.addEventListener("focus", function() {
      setDictationState("on");
    });
    window.addEventListener("blur", function() {
      setDictationState("off");
    });
  }, []);

  // Controls the mic
  useEffect(() => {
    // user action
    lastSpokenAtRef.current = Date.now();
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
      lastSpokenAtRef.current = Date.now();
      textareaUtils.insertAtCursor(deferredInterimTranscript, {
        selectInsertedText: true,
      });
    }
  }, [deferredInterimTranscript]);
  useEffect(() => {
    if (!finalTranscript) return;
    if (dictationState == "on") {
      textareaUtils.insertAtCursor(finalTranscript);
    }
    resetTranscript();
  }, [finalTranscript]);

  // Grammar doesn't work?
  // const recognition = SpeechRecognition.getRecognition();
  // window.recognition = recognition;
  // const grammar =
  //   "#JSGF V1.0; grammar colors; public <color> = Syncta | Fanita ;";
  // const speechRecognitionList = new webkitSpeechGrammarList();
  // speechRecognitionList.addFromString(grammar, 0.5);
  // recognition!.grammars = speechRecognitionList;

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
