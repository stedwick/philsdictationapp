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
      command: ["pause", "(go to) sleep"],
      callback: () => {
        setDictationState("paused");
      },
      matchInterim: true,
    },
    {
      command: ["resume", "wake up"],
      callback: (obj: { command: string; resetTranscript: Function }) => {
        const { resetTranscript } = obj;
        resetTranscript();
        setDictationState("on");
      },
      matchInterim: true,
    },
    {
      command: ["stop", "(turn) (mic) (microphone) off"],
      callback: () => {
        setDictationState("off");
      },
      matchInterim: true,
    },
  ];
}
