import { AnyActorRef } from "xstate";

export default function initializeTater(taterRef: AnyActorRef) {
  taterRef.send({ type: "initialize" });
  window.taterRef = taterRef; // DEBUG
}
