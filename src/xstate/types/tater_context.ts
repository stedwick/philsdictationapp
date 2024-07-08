export type TaterContext = {
  recognition: SpeechRecognition | null;
  textareaId: string;
  textareaEl: HTMLTextAreaElement;
  textareaCurrentValues: {
    value: string;
    beforeSelection: string;
    selection: string;
    afterSelection: string;
  };
  textareaNewValues: {
    beforeSelection: string | null;
    selection: string | null;
    afterSelection: string | null;
  };
  micState: "awake" | "asleep" | "off";
  [key: string]: any;
};

const initialTaterContext: TaterContext = {
  recognition: null,
  textareaId: "",
  textareaEl: document.createElement("textarea"),
  textareaCurrentValues: {
    value: "",
    beforeSelection: "",
    selection: "",
    afterSelection: "",
  },
  textareaNewValues: {
    beforeSelection: null,
    selection: null,
    afterSelection: null,
  },
  micState: "off",
};

export { initialTaterContext };
