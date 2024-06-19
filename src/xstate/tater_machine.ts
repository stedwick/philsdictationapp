import { setup, fromPromise, assign } from "xstate";

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
    turnMicOn: function () {},
    turnMicOff: function () {},
    checkSpeechResult: function () {},
    checkForVoiceCommand: function () {},
    setVoiceCommand: function () {},
    execCmd: function () {},
    resetSpeechCycle: function () {},
  },
  actors: {
    initSpeechAPI: fromPromise(async function () {}),
    speechAPIMachine: fromPromise(async function () {}),
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
        onDone: { target: "initialized" },
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
          invoke: {
            src: "speechAPIMachine",
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
