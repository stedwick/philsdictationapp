export type TaterContext = {
  recognition: SpeechRecognition | null;
  textareaId: string;
  textareaEl: HTMLTextAreaElement;
  textareaCurrentValues: {
    beforeSelection: string;
    selection: string;
    afterSelection: string;
  };
  textareaNewValues: {
    beforeSelection: string | null;
    selection: string | null;
    afterSelection: string | null;
  };
  [key: string]: any;
};

const initialTaterContext: TaterContext = {
  recognition: null,
  textareaId: "",
  textareaEl: document.createElement("textarea"),
  textareaCurrentValues: {
    beforeSelection: "",
    selection: "",
    afterSelection: "",
  },
  textareaNewValues: {
    beforeSelection: null,
    selection: null,
    afterSelection: null,
  },
};

export { initialTaterContext };
