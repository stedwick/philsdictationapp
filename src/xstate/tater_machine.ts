import { assign, fromPromise, raise, setup } from "xstate";
import cutText from "./actions/cut_text";
import { readTextarea, writeTextarea } from "./actions/textarea";
import initSpeechAPILogic from "./logic/init_speech_api_promise";
import speechAPILogic from "./logic/speech_api_callback";
import { TaterContext, initialTaterContext } from "./types/tater_context";
import { punctuationMachine } from "./logic/punctuation_machine";

export const taterMachine = setup({
  types: {
    input: {} as {
      textareaId: string;
    },
    context: {} as TaterContext,
  },
  actions: {
    saveText: function() { },
    loadSavedText: () => { },
    punctuateText: function() { },
    writeTextarea: ({ context: { textareaNewValues, textareaEl } }) =>
      writeTextarea({
        textareaNewValues,
        textareaEl,
      }),
    cutText: ({ context: { textareaEl } }) => cutText(textareaEl),
    turnMicOn: ({ context: { recognition } }) => recognition!.start(),
    turnMicOff: ({ context: { recognition } }) => recognition!.stop(),
    checkSpeechResult: function() { },
    checkForVoiceCommand: function() { },
    setVoiceCommand: function() { },
    execCmd: function() { },
    resetSpeechCycle: function() { },
    logHeard: ({ event }) =>
      // DEBUG: log heard
      console.log(`>>>>> Heard: ${event.result[0].transcript}`),
  },
  actors: {
    initSpeechAPI: initSpeechAPILogic,
    speechAPI: speechAPILogic,
    voiceCommandMachine: fromPromise(async function() { }),
    punctuationMachine: punctuationMachine
  },
  guards: {
    isAwake: function() {
      return true;
    },
    isAsleep: function() {
      return true;
    },
    isInterimResult: function() {
      return false;
    },
    isFinalResult: function() {
      return true;
    },
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
          target: "initializing",
          actions: assign({
            textareaEl: ({ context }) =>
              document.getElementById(
                context.textareaId!
              ) as HTMLTextAreaElement,
          }),
        },
      },
    },
    initializing: {
      entry: [{ type: "loadSavedText" }],
      invoke: {
        src: "initSpeechAPI",
        onDone: {
          target: "initialized",
          actions: [
            assign({
              recognition: ({ event }) => event.output,
            }),
            assign({
              speechApi: (params) => {
                const { context, spawn } = params;
                const recognition = context.recognition!;
                return spawn("speechAPI", {
                  id: "speechAPIMachine",
                  input: { recognition },
                });
              },
            }),
          ],
        },
        onError: { target: "errored" },
      },
    },
    errored: {
      type: "final",
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
            assign({
              textareaCurrentValues: ({ context }) =>
                readTextarea(context.textareaEl),
            }),
          ],
        },
      },
      states: {
        off: {
          on: {
            turnOn: {
              target: "on",
            },
          },
        },
        on: {
          initial: "awake",
          entry: {
            type: "turnMicOn",
          },
          exit: [{ type: "turnMicOff" }, assign({ micState: "off" })],
          on: {
            turnOff: {
              target: "off",
            },
          },
          states: {
            asleep: {
              entry: assign({ micState: "asleep" }),
              on: {
                wake: {
                  target: "awake",
                },
                hear: {
                  target: "hearingWhileAsleep",
                  actions: [
                    { type: "logHeard" },
                  ]
                },
              },
            },
            awake: {
              entry: [
                assign({ micState: "awake" }),
                ({ context: { textareaEl } }) => textareaEl.focus(),
              ],
              after: { 10000: { target: "asleep" } },
              on: {
                sleep: {
                  target: "asleep",
                },
                hear: {
                  target: "hearing",
                  actions: [
                    assign(({ event }) => ({
                      newResult: event.result[0],
                      newText: event.result[0].transcript,
                    })),
                    { type: "logHeard" },
                  ],
                },
              },
            },
            hearing: {
              entry: [
                { type: "resetSpeechCycle" },
                {
                  type: "checkSpeechResult",
                },
              ],
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
              entry: {
                type: "checkForVoiceCommand",
              },
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
                input: ({ context }) => (
                  {
                    before: context.textareaCurrentValues.beforeSelection,
                    text: context.newText || "",
                    after: context.textareaCurrentValues.afterSelection
                  }),
                onDone: {
                  actions: [
                    assign({ newText: ({ event }) => event.output }),
                  ],
                  target: "writing",
                },
                onError: {
                  actions: [
                    assign({ newText: ({ context }) => context.newText || "" }),
                  ],
                  target: "writing",
                },
              },
            },
            // TODO: Handle interim and final results
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
                {
                  type: "writeTextarea",
                },
                // Setting the value directly does not trigger an input event. Typing and pasting does.
                raise({ type: "textareaInputEvent" }),
              ],
              always: {
                target: "saving",
              },
            },
            saving: {
              entry: {
                type: "saveText",
              },
              always: {
                target: "awake",
              },
            },
            hearingWhileAsleep: {
              always: {
                target: "asleep",
              },
            },
          },
        },
      },
    },
  },
});
