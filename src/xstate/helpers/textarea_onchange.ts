import { AnyActorRef } from "xstate";

type params = {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  taterRef: AnyActorRef;
};

export const textareaOnChange = ({ textareaRef, taterRef }: params) => {
  let timeoutId: NodeJS.Timeout | null = null;
  const debounceRate = 500; // 0.5 seconds

  ["input", "select", "selectionchange", "click", "keydown"].forEach(
    (event) => {
      textareaRef.current?.addEventListener(event, () => {
        timeoutId && clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
          taterRef.send({ type: "textareaInputEvent" });
        }, debounceRate);
      });
    }
  );
};
