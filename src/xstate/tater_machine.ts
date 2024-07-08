import { assign, fromPromise, raise, setup } from "xstate";
import cutText from "./actions/cut_text";
import { readTextarea, writeTextarea } from "./helpers/textarea";
import initSpeechAPILogic from "./logic/init_speech_api_promise";
import speechAPILogic from "./logic/speech_api_callback";
import { TaterContext, initialTaterContext } from "./types/tater_context";

export const taterMachine = setup({
  types: {
    input: {} as {
      textareaId: string;
    },
    context: {} as TaterContext,
  },
  actions: {
    saveText: function () {},
    loadSavedText: () => {},
    punctuateText: function () {},
    writeTextarea: ({ context: { textareaNewValues, textareaEl } }) =>
      writeTextarea({
        textareaNewValues,
        textareaEl,
      }),
    cutText: ({ context: { textareaEl } }) => cutText(textareaEl),
    turnMicOn: ({ context: { recognition } }) => recognition!.start(),
    turnMicOff: ({ context: { recognition } }) => recognition!.stop(),
    checkSpeechResult: function () {},
    checkForVoiceCommand: function () {},
    setVoiceCommand: function () {},
    execCmd: function () {},
    resetSpeechCycle: function () {},
    logHeard: ({ event }) =>
      // DEBUG
      console.log(`>>>>> Heard: ${event.result[0].transcript}`),
  },
  actors: {
    initSpeechAPI: initSpeechAPILogic,
    speechAPI: speechAPILogic,
    voiceCommandMachine: fromPromise(async function () {}),
  },
  guards: {
    isAwake: function () {
      return true;
    },
    isAsleep: function () {
      return true;
    },
    isInterimResult: function () {
      return true;
    },
    isFinalResult: function () {
      return true;
    },
    isText: function () {
      return true;
    },
    isCommand: function () {
      return true;
    },
    isWakeCommand: function () {
      return true;
    },
    isSleepCommand: function () {
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
            raise({ type: "textareaInputEvent" }, { delay: 500 }),
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
                },
              },
            },
            awake: {
              entry: assign({ micState: "awake" }),
              after: { 5000: { target: "asleep" } },
              on: {
                sleep: {
                  target: "asleep",
                },
                hear: {
                  target: "hearing",
                  actions: [
                    assign({
                      newText: ({ event }) => event.result[0].transcript,
                    }),
                    "logHeard",
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
              entry: {
                type: "punctuateText",
              },
              always: {
                target: "writing",
              },
            },
            writing: {
              entry: [
                assign({
                  textareaNewValues: ({ context }) => ({
                    beforeSelection: null,
                    selection: context.newText,
                    afterSelection: null,
                  }),
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
            hearingWhileAsleep: {},
          },
        },
      },
    },
  },
});
