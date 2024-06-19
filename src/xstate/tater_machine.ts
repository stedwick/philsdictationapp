import { setup, fromPromise, assign, spawnChild } from "xstate";
import initSpeechAPI from "./logic/init_speech_api_async";
import speechApiLogic from "./logic/speech_api_callback";

export const taterMachine = setup({
  types: {
    input: {} as {
      textareaId: string;
    },
  },
  actions: {
    saveText: function () {},
    loadSavedText: function () {},
    punctuateText: function () {},
    updateTextarea: function () {},
    turnMicOn: function ({ context }) {
      context.recognition.start();
    },
    turnMicOff: function ({ context }) {
      context.recognition.stop();
    },
    checkSpeechResult: function () {},
    checkForVoiceCommand: function () {},
    setVoiceCommand: function () {},
    execCmd: function () {},
    resetSpeechCycle: function () {},
  },
  actors: {
    initSpeechAPI: fromPromise(initSpeechAPI),
    speechAPIMachine: speechApiLogic,
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
    textareaId: input.textareaId,
  }),
  id: "Tater",
  initial: "uninitialized",
  states: {
    uninitialized: {
      on: {
        initialize: {
          target: "initializing",
        },
      },
    },
    initializing: {
      entry: {
        type: "loadSavedText",
      },
      invoke: {
        src: "initSpeechAPI",
        onDone: {
          target: "initialized",
          actions: [
            assign({
              recognition: ({ event }) => event.output,
            }),
            assign({
              speechApi: ({ context, spawn }) => {
                return spawn("speechAPIMachine", {
                  id: "speechAPIMachine",
                  input: { recognition: context.recognition },
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
      states: {
        off: {
          entry: {
            type: "turnMicOff",
          },
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
          on: {
            turnOff: {
              target: "off",
            },
          },
          states: {
            asleep: {
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
              on: {
                sleep: {
                  target: "asleep",
                },
                hear: {
                  target: "hearing",
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
              entry: {
                type: "updateTextarea",
              },
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
