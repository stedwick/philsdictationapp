// types.d.ts
// declare module "use-navigator-online";

import { AnyActorRef } from "xstate";

declare global {
  interface Window {
    taterRef: AnyActorRef;
    regex: RegExp;
  }
}

interface ImportMeta {
  env: Record<string, string>;
}
