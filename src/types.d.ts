// types.d.ts
// declare module "use-navigator-online";

import { AnyActorRef } from "xstate";

declare global {
  interface Window {
    taterRef: AnyActorRef;
    regex: RegExp;
    transcribeMicrophoneRealTime: function;
  }
}

interface ImportMeta {
  env: Record<string, string>;
}
