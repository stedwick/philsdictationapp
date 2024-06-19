import { useActorRef } from "@xstate/react";

type actorRef = ReturnType<typeof useActorRef>;

export default function subscribeToTater(taterRef: actorRef) {
  const subscription = taterRef.subscribe((snapshot) => {
    // simple logging
    console.log("VALUE:");
    console.log(snapshot.value);
    console.log("CONTEXT:");
    console.log(snapshot.context);
    // if (snapshot.matches("initialized")) console.log("BOOM");
  });

  return subscription.unsubscribe;
}
