import { EventObject, fromCallback } from "xstate";

export default fromCallback<EventObject>(({ sendBack }) => {
  window.addEventListener("focus", function() {
    sendBack({ type: "autoOn" });
  });
  window.addEventListener("blur", function() {
    sendBack({ type: "autoOff" });
  });
});

