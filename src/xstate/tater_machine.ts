import { assign, fromPromise, raise, setup } from "xstate";
import cutText from "./actions/cut_text";
import { selectNewText, writeTextarea } from "./actions/textarea";
import { aTextareaEl } from "./assigns/init";
import initSpeechAPILogic from "./logic/init_speech_api_promise";
import { punctuationMachine } from "./logic/punctuation_machine";
import speechAPILogic from "./logic/speech_api_callback";
import { TaterContext, initialTaterContext } from "./types/tater_context";
import { aTextareaCurrentValues } from "./assigns/textarea";
import { loadSavedText, saveText } from "./actions/save_and_load";

const debugLog = import.meta.env.VITE_DEBUG === "true";

export const taterMachine = setup({
  types: {
    input: {} as {
      textareaId: string;
    },
    context: {} as TaterContext,
  },
  actions: {
    saveText,
    loadSavedText,
    writeTextarea,
    selectNewText,
    cutText: ({ context: { textareaEl } }) => cutText(textareaEl),
    turnMicOn: ({ context: { recognition } }) => recognition!.start(),
    turnMicOff: ({ context: { recognition } }) => recognition!.stop(),
    checkSpeechResult: function() { },
    checkForVoiceCommand: function() { },
    setVoiceCommand: function() { },
    execCmd: function() { },
    resetSpeechCycle: function() { },
    focus: ({ context: { textareaEl } }) => textareaEl.focus(),
    logHeard: ({ event }) => debugLog && console.log(`>>>>> Heard: ${event.result[0].transcript}`),
  },
  actors: {
    initSpeechAPI: initSpeechAPILogic,
    speechAPI: speechAPILogic,
    punctuationMachine: punctuationMachine,
    voiceCommandMachine: fromPromise(async function() { }),
  },
  guards: {
    isAwake: function() {
      return true;
    },
    isAsleep: function() {
      return true;
    },
    isInterimResult: ({ context: { newResult } }) => !!!newResult?.isFinal,
    isFinalResult: ({ context: { newResult } }) => !!newResult?.isFinal,
    isText: function() {
      return true;
    },
    isCommand: function() {
      return false;
    },
    isWakeCommand: function() {
      return true;
    },
    isSleepCommand: function() {
      return true;
    },
  },
}).createMachine({
  context: ({ input }) => ({
    ...initialTaterContext,
    textareaId: input.textareaId,
  }),
  id: "Tater",
  initial: "uninitialized",
  states: {
    uninitialized: {
      on: {
        initialize: {
          actions: assign(aTextareaEl),
          target: "initializing",
        },
      },
    },
    initializing: {
      entry: [
        { type: "loadSavedText" },
        { type: "focus" },
        assign(aTextareaCurrentValues),
      ],
      invoke: {
        src: "initSpeechAPI",
        onDone: {
          actions: [
            assign({ recognition: ({ event }) => event.output }),
            assign({
              speechApi: ({ context, spawn }) => {
                const recognition = context.recognition!;
                return spawn("speechAPI", {
                  id: "speechAPIMachine",
                  input: { recognition },
                });
              },
            }),
          ],
          target: "initialized",
        },
        onError: { target: "errored" },
      },
    },
    errored: {
      type: "final"
    },
    initialized: {
      initial: "off",
      on: {
        cut: {
          actions: [
            { type: "cutText" },
            // navigator.clipboard is asynchronous and does not trigger a textarea change event
            raise({ type: "textareaInputEvent" }, { delay: 250 }),
            raise({ type: "sleep" }, { delay: 250 }),
          ],
        },
        textareaInputEvent: {
          actions: [
            assign(aTextareaCurrentValues),
            { type: "saveText" }
          ]
        },
      },
      states: {
        off: { on: { turnOn: { target: "on" } } },
        on: {
          initial: "awake",
          entry: { type: "turnMicOn" },
          exit: [{ type: "turnMicOff" }, assign({ micState: "off" })],
          on: { turnOff: { target: "off" } },
          states: {
            asleep: {
              entry: assign({ micState: "asleep" }),
              on: {
                wake: { target: "awake", },
                hear: {
                  target: "hearingWhileAsleep",
                  actions: { type: "logHeard" }
                },
              },
            },
            awake: {
              entry: [
                assign({ micState: "awake" }),
                { type: "focus" }
              ],
              after: { 10000: { target: "asleep" } },
              on: {
                sleep: { target: "asleep" },
                hear: {
                  target: "hearing",
                  actions: [
                    assign(({ event }) => ({
                      newResult: event.result,
                      newText: event.result[0].transcript,
                    })),
                    { type: "logHeard" },
                  ],
                },
              },
            },
            hearing: {
              always: [
                {
                  target: "writing",
                  guard: {
                    type: "isInterimResult",
                  },
                },
                {
                  target: "interpreting",
                  guard: {
                    type: "isFinalResult",
                  },
                },
              ],
            },
            interpreting: {
              always: [
                {
                  target: "runningVoiceCommand",
                  guard: {
                    type: "isCommand",
                  },
                },
                {
                  target: "punctuating",
                  guard: {
                    type: "isText",
                  },
                },
              ],
            },
            runningVoiceCommand: {
              invoke: {
                src: "voiceCommandMachine",
                onDone: { target: "awake" },
                onError: { target: "awake" },
              },
            },
            punctuating: {
              invoke: {
                src: "punctuationMachine",
                input: ({ context: { textareaCurrentValues, newText } }) => (
                  {
                    before: textareaCurrentValues.beforeSelection,
                    text: newText || "",
                    after: textareaCurrentValues.afterSelection
                  }),
                onDone: {
                  actions: [
                    assign({ newText: ({ event }) => event.output }),
                    ({ event }) => debugLog && console.log("punctuated: [", event.output, "]"),
                  ],
                  target: "writing",
                },
                onError: {
                  actions: assign({ newText: ({ context }) => context.newText || "" }),
                  target: "writing",
                },
              },
            },
            // TODO: Scroll into view
            writing: {
              entry: [
                assign({
                  textareaNewValues: ({ context }) => ({
                    beforeSelection: null,
                    selection: context.newText,
                    afterSelection: null,
                  })
                }),
                { type: "writeTextarea" },
                // Setting the value directly does not trigger an input event. Typing and pasting does.
                raise({ type: "textareaInputEvent" }),
              ],
              always: [
                {
                  target: "selectingNewText",
                  guard: { type: "isInterimResult" }
                },
                {
                  target: "saving",
                  guard: { type: "isFinalResult" }
                },
              ],
            },
            selectingNewText: {
              entry: [
                { type: "selectNewText" },
                raise({ type: "textareaInputEvent" })
              ],
              always: { target: "saving" },
            },
            saving: {
              entry: { type: "saveText" },
              always: { target: "awake" },
            },
            hearingWhileAsleep: {
              always: { target: "asleep" },
            },
          },
        },
      },
    },
  },
});
