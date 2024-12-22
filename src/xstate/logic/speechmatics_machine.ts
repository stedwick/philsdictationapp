import {
  type AddPartialTranscript,
  type AddTranscript,
  RealtimeClient,
  type TranscriptionConfig,
} from "@speechmatics/real-time-client";
import { type AnyActorRef, fromPromise, setup } from "xstate";

type result = {
  transcript: string;
  isFinal: boolean;
};
const getTranscript = (data: AddTranscript | AddPartialTranscript) =>
  data.results.map((r) => r.alternatives?.[0].content).join(" ");

// TODO
const default_transcription_config: TranscriptionConfig = {
  language: "en",
  diarization: "none",
  additional_vocab: [
    {
      content: "Syncta",
    },
    {
      content: "SentryPlus",
    },
    {
      content: "Nadeem",
    },
    {
      content: "Fanita",
    },
    {
      content: "Watts",
    },
    {
      content: "Facundo",
    },
    {
      content: "Ilein",
    },
    {
      content: "Zach",
    },
  ],
  operating_point: "enhanced",
  max_delay_mode: "flexible",
  max_delay: 2,
  enable_partials: true,
  enable_entities: true,
  output_locale: "en-US",
  transcript_filtering_config: {
    remove_disfluencies: true,
  },
};

type listenerLogicInput = { input: { jwt: string; client: RealtimeClient } };
const listenerLogic = fromPromise(
  async ({ input: { jwt, client } }: listenerLogicInput) => {
    // Get microphone stream
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    // Create AudioContext to process the stream
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);

    // Add AudioWorklet
    await audioContext.audioWorklet.addModule("/audio-processor.js");
    const workletNode = new AudioWorkletNode(audioContext, "audio-processor");

    workletNode.port.onmessage = (event) => {
      client.sendAudio(event.data);
    };

    // Connect the audio nodes
    source.connect(workletNode);
    workletNode.connect(audioContext.destination);

    // Start Speechmatics!
    await client.start(jwt, {
      transcription_config: default_transcription_config,
      audio_format: {
        type: "raw",
        encoding: "pcm_f32le",
        sample_rate: audioContext.sampleRate,
      },
    });

    // Return cleanup function
    return () => {
      client.stopRecognition();
      stream.getTracks().forEach((track) => track.stop());
      source.disconnect();
      workletNode.disconnect();
    };
  }
);

const speechmaticsMachine = setup({
  types: {
    input: {} as {
      receiver: AnyActorRef;
    },
    context: {} as {
      receiver: AnyActorRef;
      client: RealtimeClient;
      jwt: string;
      cleanup?: () => void;
    },
    events: {} as { type: "start" } | { type: "stop" },
  },
  actors: {
    listener: listenerLogic,
  },
}).createMachine({
  context: ({ input }) => ({
    receiver: input.receiver,
    client: new RealtimeClient(),
    jwt: "",
  }),
  initial: "initializing",
  states: {
    initializing: {
      entry: [
        ({ context: { receiver, client } }) => {
          client.addEventListener("receiveMessage", ({ data }) => {
            switch (data.message) {
              case "AddPartialTranscript": {
                receiver.send({
                  type: "hear",
                  result: { transcript: getTranscript(data), isFinal: false },
                });
                break;
              }
              case "AddTranscript": {
                receiver.send({
                  type: "hear",
                  result: { transcript: getTranscript(data), isFinal: true },
                });
                break;
              }
              case "EndOfTranscript": {
                receiver.send({ type: "turnOff" });
                // raise({ type: "stop" });
                break;
              }
              case "Error": {
                console.error("Speechmatics error:", data);
                receiver.send({ type: "turnOff" });
                // raise({ type: "stop" });
                break;
              }
            }
          });
        },
      ],
      always: "ready",
    },
    ready: {
      on: {
        start: "turningOnMic",
      },
    },
    turningOnMic: {
      invoke: {
        src: "listener",
        input: ({ context: { jwt, client } }) => ({
          jwt,
          client,
        }),
        onDone: {
          target: "listening",
          // actions: assign(({ event }) => {
          //   return { cleanup: event.output };
          // }),
        },
        onError: {
          target: "error",
          actions: ({ event }) =>
            console.error("Speechmatics error:", event.error),
        },
      },
    },
  },
});

export { speechmaticsMachine };
export type { result };
