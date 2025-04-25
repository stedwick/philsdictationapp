import { TaterContext } from "../types/tater_context";

type params = {
  context: TaterContext;
}

const turnMicOn = ({ context: { recognition } }: params) => {
  try {
    recognition!.start();
  } catch (e) {
    if (e instanceof DOMException) {
      if (e.message.includes("already started")) {
        console.log("*Error in turnMicOn, but it's OK: speech recognition has already started.");
        return true;
      }
    }
    throw e; // Not ok, lol
  }
}

export { turnMicOn };
