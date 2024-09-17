import { assign, fromPromise, raise, setup } from "xstate";
import { loadConfig, saveConfig } from "./actions/config";
import cutText from "./actions/cut_text";
import { loadSavedText, saveText } from "./actions/save_and_load";
import { selectNewText, writeTextarea } from "./actions/textarea";
import { turnMicOn } from "./actions/turn_mic_on";
import { aTextareaEl } from "./assigns/init";
import { aTextareaCurrentValues } from "./assigns/textarea";
import initSpeechAPILogic from "./logic/init_speech_api_promise";
import { punctuationMachine } from "./logic/punctuation_machine";
import speechAPILogic from "./logic/speech_api_callback";
import textareaLogic from "./logic/textarea_callback";
import windowLogic from "./logic/window_callback";
import { TaterContext, initialTaterContext } from "./types/tater_context";
import { isMobile } from "./helpers/mobile";

const debugLog = false; // import.meta.env.VITE_DEBUG;

export const taterMachine = setup({
  types: {
    input: {} as {
      textareaId: string;
    },
    context: {} as TaterContext,
  },
  actions: {
    saveConfig,
    saveText,
    loadSavedText,
    writeTextarea,
    selectNewText,
    cutText: ({ context: { textareaEl } }) => cutText(textareaEl),
    // MAYBE: resetMic? Occasionally the web speech API sends interim results
    // but never a final result, so Tater gets stuck with highlighted text.
    turnMicOn,
    turnMicOff: ({ context: { recognition } }) => recognition!.stop(),
    checkSpeechResult: function () { },
    checkForVoiceCommand: function () { },
    setVoiceCommand: function () { },
    execCmd: function () { },
    resetSpeechCycle: function () { },
    focus: ({ context: { textareaEl } }) => { if (isMobile) return; textareaEl.blur(); textareaEl.focus() },
    logHeard: ({ event }) => debugLog && console.log(`heard: ${event.result[0].transcript}`),
    logNewText: ({ context: { newText } }) => console.log(`heard: ${newText}`),
  },
  actors: {
    initSpeechAPILogic,
    speechAPILogic,
    textareaLogic,
    windowLogic,
    punctuationMachine,
    voiceCommandMachine: fromPromise(async function () { }),
  },
  guards: {
    isAwake: function () {
      return true;
    },
    isAsleep: function () {
      return true;
    },
    isInterimResult: ({ context: { newResult } }) => !!!newResult?.isFinal,
    isFinalResult: ({ context: { newResult } }) => !!newResult?.isFinal,
    isText: function () {
      return true;
    },
    isCommand: function () {
      return false;
    },
    isWakeCommand: function () {
      return true;
    },
    isSleepCommand: function () {
      return true;
    },
    isAutoMic: ({ context: { config: { autoMic } } }) => autoMic,
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
        assign({ config: loadConfig() }),
      ],
      invoke: {
        src: "initSpeechAPILogic",
        onDone: {
          actions: [
            assign({ recognition: ({ event }) => event.output }),
            assign({
              speechApiActor: ({ context, spawn }) => {
                const recognition = context.recognition!;
                return spawn("speechAPILogic", {
                  id: "speechAPIMachine",
                  input: { recognition },
                });
              },
              textareaActor: ({ context: { textareaEl }, spawn }) => {
                return spawn("textareaLogic", {
                  id: "textareaMachine",
                  input: { textareaEl },
                });
              },
              windowActor: ({ spawn }) => spawn("windowLogic", { id: "windowMachine", }),
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
        setConfig: {
          actions: [
            assign({
              config: ({ context: { config }, event }) => {
                config[event.key] = event.value;
                return config;
              }
            }),
            { type: "saveConfig" }
          ]
        }
      },
      states: {
        off: {
          on: {
            turnOn: { target: "on" },
            autoOn: {
              target: "on",
              guard: "isAutoMic",
            }
          },
        },
        on: {
          initial: "awake",
          entry: { type: "turnMicOn" },
          exit: [{ type: "turnMicOff" }, assign({ micState: "off" })],
          on: {
            turnOff: { target: "off" },
            autoOff: {
              target: "off",
              // Should Sleep listen in the background? I think I want another config option for listening in the background.
              // [Sleep] Listen in the background
              // guard: "isAutoMic",
            }
          },
          states: {
            asleep: {
              entry: assign({ micState: "asleep" }),
              on: {
                wake: { target: "awake", },
                autoOn: {
                  target: "awake",
                  guard: "isAutoMic",
                },
                hear: {
                  target: "hearingWhileAsleep",
                  actions: { type: "logHeard" }
                },
              },
              // MAYBE: [Sleep] Implement asleep state
              always: { target: "#Tater.initialized.off" },
            },
            awake: {
              entry: [
                assign({ micState: "awake" }),
                { type: "focus" }
              ],
              after: { 15000: { target: "asleep" } },
              on: {
                sleep: { target: "asleep" },
                hear: {
                  target: "hearing",
                  actions: [
                    assign(({ event }) => ({
                      newResult: event.result,
                      newText: event.result[0].transcript,
                    })),
                    { type: "logHeard", }
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
              entry: ["logNewText"],
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
                    ({ event }) => console.log("punctuated: [", event.output, "]"),
                  ],
                  target: "writing",
                },
                onError: {
                  actions: assign({ newText: ({ context }) => context.newText || "" }),
                  target: "writing",
                },
              },
            },
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
                // Blurring and then refocusing scrolls the text into view if it's past the bottom of the text area.
                { type: "focus" },
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
            // [Sleep] Wake up command
            hearingWhileAsleep: {
              always: { target: "asleep" },
            },
          },
        },
      },
    },
  },
});
