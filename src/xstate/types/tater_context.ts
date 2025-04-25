import { AnyActorRef } from "xstate";

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
  config: {
    autoMic: boolean;
    [key: string]: any;
  };
  newResult: SpeechRecognitionResult | null;
  newText: string | null;
  micState: "awake" | "asleep" | "off";
  speechApiActor?: AnyActorRef | null;
  textareaActor?: AnyActorRef | null;
  windowActor?: AnyActorRef | null;
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
  config: {
    autoMic: false,
  },
  newResult: null,
  newText: null,
  micState: "off",
};

export { initialTaterContext };
