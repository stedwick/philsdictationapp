import { TaterContext } from "../types/tater_context";

export const aTextareaEl = {
  textareaEl: ({ context }: { context: TaterContext }) =>
    document.getElementById(
      context.textareaId!
    ) as HTMLTextAreaElement,
}
