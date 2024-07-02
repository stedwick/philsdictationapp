import { useActorRef } from "@xstate/react";

type actorRef = ReturnType<typeof useActorRef>;

export default function initializeTater(taterRef: actorRef) {
  taterRef.send({ type: "initialize" });
  window.taterRef = taterRef;
}
