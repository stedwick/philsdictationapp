import { setup, fromPromise } from "xstate";

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
    turnMicOn: function () {},
    turnMicOff: function () {},
    checkSpeechResult: function () {},
    checkForVoiceCommand: function () {},
    setVoiceCommand: function () {},
    execCmd: function () {},
    updateTextarea: function () {},
    reset: function () {},
  },
  actors: {
    initSpeechAPI: fromPromise(async function () {}),
    speechAPIMachine: fromPromise(async function () {}),
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
  context: ({ input }) => {
    textareaId: input.textareaId;
  },
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
          on: {
            turnOn: {
              target: "on",
            },
          },
          entry: {
            type: "turnMicOff",
          },
        },
        on: {
          initial: "listening",
          on: {
            turnOff: {
              target: "off",
            },
          },
          entry: {
            type: "turnMicOn",
          },
          invoke: {
            input: {},
            src: "speechAPIMachine",
          },
          states: {
            listening: {
              initial: "awake",
              on: {
                hear: {
                  target: "hearing",
                },
              },
              exit: {
                type: "reset",
              },
              states: {
                awake: {
                  on: {
                    sleep: {
                      target: "asleep",
                    },
                  },
                },
                asleep: {
                  on: {
                    wake: {
                      target: "awake",
                    },
                  },
                },
                hist: {
                  type: "history",
                  history: "shallow",
                },
              },
            },
            hearing: {
              always: [
                {
                  target: "interpreting",
                  guard: {
                    type: "isFinalResult",
                  },
                },
                {
                  target: "#Tater.initialized.on.listening.hist",
                  guard: {
                    type: "isAsleep",
                  },
                },
                {
                  target: "writing",
                  guard: {
                    type: "isInterimResult",
                  },
                },
              ],
              entry: {
                type: "checkSpeechResult",
              },
            },
            interpreting: {
              always: [
                {
                  target: "processingVoiceCommand",
                  guard: {
                    type: "isCommand",
                  },
                },
                {
                  target: "#Tater.initialized.on.listening.hist",
                  guard: {
                    type: "isAsleep",
                  },
                },
                {
                  target: "punctuating",
                  guard: {
                    type: "isText",
                  },
                },
              ],
              entry: {
                type: "checkForVoiceCommand",
              },
            },
            writing: {
              always: {
                target: "saving",
              },
              entry: {
                type: "updateTextarea",
              },
            },
            processingVoiceCommand: {
              initial: "determiningCommand",
              onDone: {
                target: "#Tater.initialized.on.listening.hist",
              },
              states: {
                determiningCommand: {
                  always: [
                    {
                      target: "#Tater.initialized.on.listening.awake",
                      guard: {
                        type: "isWakeCommand",
                      },
                    },
                    {
                      target: "#Tater.initialized.on.listening.asleep",
                      guard: {
                        type: "isSleepCommand",
                      },
                    },
                    {
                      target: "commandFinished",
                      guard: {
                        type: "isAsleep",
                      },
                    },
                    {
                      target: "runningCommand",
                    },
                  ],
                  entry: {
                    type: "setVoiceCommand",
                  },
                },
                commandFinished: {
                  type: "final",
                },
                runningCommand: {
                  always: {
                    target: "commandFinished",
                  },
                  entry: {
                    type: "execCmd",
                  },
                },
              },
            },
            punctuating: {
              always: {
                target: "writing",
              },
              entry: {
                type: "punctuateText",
              },
            },
            saving: {
              always: {
                target: "#Tater.initialized.on.listening.hist",
              },
              entry: {
                type: "saveText",
              },
            },
          },
        },
      },
    },
  },
});
