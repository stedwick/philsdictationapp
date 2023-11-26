import { TextareaUtils } from "./TextareaUtils";

interface GenerateCommandsOpts {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  textareaUtils: TextareaUtils;
  setDictationState: React.Dispatch<
    React.SetStateAction<"on" | "off" | "paused">
  >;
}

export function generateCommands(opts: GenerateCommandsOpts) {
  const { textareaRef, textareaUtils, setDictationState } = opts;
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
  ];
}
