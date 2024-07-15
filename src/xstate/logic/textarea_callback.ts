import { EventObject, fromCallback } from "xstate";

export default fromCallback<EventObject, { textareaEl: HTMLTextAreaElement }>(
  ({ sendBack, input: { textareaEl } }) => {
    let timeoutId: NodeJS.Timeout | null = null;
    const debounceRate = 500; // 0.5 seconds

    ["input", "select", "selectionchange", "click", "keydown"].forEach(
      (event) => {
        textareaEl.addEventListener(event, () => {
          timeoutId && clearTimeout(timeoutId);
          timeoutId = setTimeout(function() {
            sendBack({ type: "textareaInputEvent" });
          }, debounceRate);
        });
      }
    );
  }
);

