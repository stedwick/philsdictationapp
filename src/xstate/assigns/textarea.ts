import { readTextarea } from "../actions/textarea";
import { TaterContext } from "../types/tater_context";

export const aTextareaCurrentValues = {
  textareaCurrentValues: ({ context: { textareaEl } }: { context: TaterContext }) => readTextarea(textareaEl),
}
