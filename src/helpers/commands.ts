import { TextareaUtils } from "./TextareaUtils";

interface GenerateCommandsOpts {
  textareaUtils: TextareaUtils;
  dictationStateRef: React.MutableRefObject<string>;
  setDictationState: React.Dispatch<
    React.SetStateAction<"on" | "off" | "paused">
  >;
}

// TODO: Need a better way to store history and process commands without typing.
export function generateCommands(opts: GenerateCommandsOpts) {
  const { textareaUtils, dictationStateRef, setDictationState } = opts;
  return [
    {
      command: ["pause(.)", "(go to) sleep(.)"],
      // callback: (obj: { command: string; resetTranscript: Function }) => {
      callback: () => {
        setDictationState("paused");
        textareaUtils.undoCurrentInsert();
      },
    },
    {
      command: ["resume(.)", "wake up(.)"],
      callback: () => {
        setTimeout(() => {
          setDictationState("on");
          // textareaUtils.undoPreviousInsert();
        }, 500);
      },
    },
    {
      command: ["stop(.)", "(turn) (mic) (Mike) (microphone) off(.)"],
      callback: () => {
        setDictationState("off");
        textareaUtils.undoCurrentInsert();
      },
    },
    {
      command: ["undo (that)(.)", "scratch (that)(.)"],
      callback: () => {
        if (dictationStateRef.current != "on") return;
        setDictationState("paused");
        textareaUtils.undoPreviousInsert();
        setTimeout(() => {
          setDictationState("on");
        }, 500);
      },
    },
  ];
}
