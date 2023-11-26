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
      callback: (obj: { command: string; resetTranscript: Function }) => {
        setDictationState("paused");
        textareaUtils.undoLastInsert();
      },
    },
    {
      command: ["resume(.)", "wake up(.)"],
      callback: () => {
        setDictationState("on");
      },
    },
    {
      command: ["stop(.)", "(turn) (mic) (Mike) (microphone) off(.)"],
      callback: () => {
        setDictationState("off");
      },
    },
  ];
}
