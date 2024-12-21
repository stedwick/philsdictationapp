import {
  type AddPartialTranscript,
  type AddTranscript,
  RealtimeClient,
} from "@speechmatics/real-time-client";
import { type AnyActorRef, setup } from "xstate";

type result = {
  transcript: string;
  isFinal: boolean;
};
const getTranscript = (data: AddTranscript | AddPartialTranscript) =>
  data.results.map((r) => r.alternatives?.[0].content).join(" ");

const speechmaticsMachine = setup({
  types: {
    input: {} as {
      receiver: AnyActorRef;
    },
    context: {} as {
      receiver: AnyActorRef;
      client: RealtimeClient;
    },
  },
}).createMachine({
  context: ({ input }) => ({
    receiver: input.receiver,
    client: new RealtimeClient(),
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
                break;
              }
              case "Error": {
                console.error("Speechmatics error:", data);
                receiver.send({ type: "turnOff" });
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
      entry: () => {},
    },
  },
});

export { speechmaticsMachine };
export type { result };
