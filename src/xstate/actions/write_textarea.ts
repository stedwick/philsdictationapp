import readTextareaValues from "../helpers/read_textarea";

type params = {
  textareaEl: HTMLTextAreaElement;
  newText: string;
};

export default function writeTextarea(_: any, { textareaEl, newText }: params) {
  const currentValues = readTextareaValues(textareaEl);
  textareaEl.value =
    currentValues.beforeSelection +
    " " +
    newText +
    " " +
    currentValues.afterSelection;
}
