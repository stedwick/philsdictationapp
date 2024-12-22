import { RealtimeClient } from "@speechmatics/real-time-client";
import { fromCallback } from "xstate";

type SpeechmaticsEvents =
  | { type: "start" }
  | { type: "stop" }
  | { type: "hear"; result: { text: string; isFinal: boolean } }
  | { type: "turnOff" };

const speechmaticsLogic = fromCallback<SpeechmaticsEvents>(
  ({ receive, sendBack }) => {
    const client = new RealtimeClient();
    let cleanup: (() => void) | null = null;

    // Set up client event listeners
    client.addEventListener("receiveMessage", ({ data }) => {
      if (data.message === "AddPartialTranscript") {
        const text = data.metadata.transcript;
        // console.log("Speechmatics message: ", data);
        console.log("Partial transcript: ", text);
        sendBack({
          type: "hear",
          result: { text, isFinal: false },
        });
      } else if (data.message === "AddTranscript") {
        const text = data.metadata.transcript;
        // console.log("Speechmatics message: ", data);
        console.log("Final transcript: ", text);
        sendBack({
          type: "hear",
          result: { text, isFinal: true },
        });
      } else if (data.message === "EndOfTranscript") {
        sendBack({ type: "turnOff" });
      }
    });

    // Handle events from the state machine
    receive(async (event) => {
      if (event.type === "start") {
        try {
          cleanup = await transcribeMicrophoneRealTime(client);
        } catch (error) {
          console.error("Speechmatics error:", error);
          sendBack({ type: "turnOff" });
        }
      } else if (event.type === "stop") {
        cleanup?.();
        cleanup = null;
      }
    });

    return () => {
      cleanup?.();
    };
  }
);

// Helper function moved inside the module
async function transcribeMicrophoneRealTime(client: RealtimeClient) {
  // curl -L -X POST "https://mp.speechmatics.com/v1/api_keys?type=rt"      -H "Content-Type: application/json"      -H "Authorization: Bearer $SPEECHMATICS_API_KEY"      -d '{"ttl": 86400, "client_ref": "USER123"}'
  const jwt = import.meta.env.VITE_SPEECHMATICS_JWT;
  console.log("JWT: ", jwt);

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

  await client.start(jwt, {
    transcription_config: {
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
    },
    audio_format: {
      type: "raw",
      encoding: "pcm_f32le",
      sample_rate: audioContext.sampleRate,
    },
  });

  // Connect the audio nodes
  source.connect(workletNode);
  workletNode.connect(audioContext.destination);

  // Add cleanup function
  return () => {
    client.stopRecognition();
    stream.getTracks().forEach((track) => track.stop());
    source.disconnect();
    workletNode.disconnect();
  };
}

export { speechmaticsLogic };
