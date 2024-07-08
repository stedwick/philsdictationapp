import { TextareaUtils } from "./TextareaUtils";
import { execCopy, execCut, execPasteToApp } from "./clipboard";

interface GenerateCommandsOpts {
  textareaUtils: TextareaUtils;
  dictationStateRef: React.MutableRefObject<string>;
  setDictationState: React.Dispatch<
    React.SetStateAction<"on" | "off" | "paused">
  >;
}

export function generateCommands(opts: GenerateCommandsOpts) {
  const { textareaUtils, dictationStateRef, setDictationState } = opts;
  function around(opts: {
    func: Function;
    pause: boolean;
    resume: boolean;
    always: boolean;
  }) {
    const { func, pause, resume, always } = opts;
    if (pause) {
      setDictationState("paused");
      textareaUtils.undoCurrentInsert();
    }
    if (always || dictationStateRef.current == "on") func();
    if (resume) {
      setTimeout(() => {
        setDictationState("on");
        // textareaUtils.undoPreviousInsert();
      }, 500);
    }
  }

  return [
    {
      command: ["pause(.)", "(go to) sleep(.)"],
      // callback: (obj: { command: string; resetTranscript: Function }) => {
      callback: () => {
        around({ pause: true, resume: false, always: true, func: () => {} });
      },
    },
    {
      command: ["resume(.)", "wake up(.)"],
      callback: () => {
        around({ pause: false, resume: true, always: true, func: () => {} });
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
        textareaUtils.undoPreviousInsert(); // use around?
        setTimeout(() => {
          setDictationState("on");
        }, 500);
      },
    },
    {
      command: ["(go to) beginning(.)", "(go) home(.)"],
      callback: () => {
        around({
          pause: true,
          resume: true,
          always: false,
          func: () => {
            textareaUtils.goHome();
          },
        });
      },
    },
    {
      command: ["(go to) end(.)"],
      callback: () => {
        around({
          pause: true,
          resume: true,
          always: false,
          func: () => {
            textareaUtils.goEnd();
          },
        });
      },
    },
    {
      command: ["select all(.)"],
      callback: () => {
        around({
          pause: true,
          resume: true,
          always: false,
          func: () => {
            textareaUtils.selectAll();
          },
        });
      },
    },
    {
      command: ["copy (that)(it)(.)"],
      callback: () => {
        around({
          pause: true,
          resume: false,
          always: false,
          func: () => {
            execCopy(textareaUtils.textareaRef, setDictationState);
          },
        });
      },
    },
    {
      command: ["cut (that)(it)(.)"],
      callback: () => {
        around({
          pause: true,
          resume: false,
          always: false,
          func: () => {
            execCut(textareaUtils.textareaRef, setDictationState);
          },
        });
      },
    },
    {
      command: ["paste (that)(it) (over) (to) (app)(.)"],
      callback: () => {
        around({
          pause: true,
          resume: false,
          always: false,
          func: () => {
            execPasteToApp(textareaUtils.textareaRef, setDictationState);
          },
        });
      },
    },
  ];
}
