import { AnyActorRef } from "xstate";

export default function subscribeToTater(taterRef: AnyActorRef) {
  if (import.meta.env.VITE_DEBUG) {
    let timeoutId: NodeJS.Timeout | null = null;
    const debounceRate = 1500;

    const subscription = taterRef.subscribe((snapshot) => {
      timeoutId && clearTimeout(timeoutId);
      timeoutId = setTimeout(function() {
        console.log(snapshot);
      }, debounceRate);
    });

    return subscription.unsubscribe;
  }
}
