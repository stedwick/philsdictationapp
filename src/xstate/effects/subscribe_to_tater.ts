import { AnyActorRef } from "xstate";

export default function subscribeToTater(taterRef: AnyActorRef) {
  const subscription = taterRef.subscribe((snapshot) => {
    // DEBUG
    console.log("VALUE:");
    console.log(snapshot.value);
    console.log("CONTEXT:");
    console.log(snapshot.context);
    if (snapshot.matches("initialized")) console.log("BOOM initialized");
  });

  return subscription.unsubscribe;
}
