import { AnyActorRef } from "xstate";

export default function subscribeToTater(taterRef: AnyActorRef) {
  if (import.meta.env.VITE_DEBUG) {
    const subscription = taterRef.subscribe((snapshot) => {
      console.log(snapshot.value);
      console.log(snapshot.context.textareaCurrentValues);
    });

    return subscription.unsubscribe;
  }
}
