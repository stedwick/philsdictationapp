import { createActorContext } from "@xstate/react";
import { taterMachine } from "./tater_machine";

export const taterMachineContext = createActorContext(taterMachine, {
  input: { textareaId: "taterTextarea" },
});
