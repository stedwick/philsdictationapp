import type { TaterContext } from "../types/tater_context";

const readTextarea = (el: HTMLTextAreaElement) => ({
  value: el.value,
  beforeSelection: el.value.substring(0, el.selectionStart),
  selection: el.value.substring(el.selectionStart, el.selectionEnd),
  afterSelection: el.value.substring(el.selectionEnd, el.textLength),
});

type WriteParams = {
  textareaNewValues: TaterContext["textareaNewValues"];
  textareaEl: HTMLTextAreaElement;
};

function writeTextarea({ textareaNewValues, textareaEl }: WriteParams) {
  const currentValues = readTextarea(textareaEl);

  const beforeSelection =
    textareaNewValues.beforeSelection || currentValues.beforeSelection;
  const selection = textareaNewValues.selection || currentValues.selection;
  const afterSelection =
    textareaNewValues.afterSelection || currentValues.afterSelection;

  // TODO add spacing correctly
  textareaEl.value = beforeSelection + " " + selection + " " + afterSelection;

  textareaEl.selectionStart = beforeSelection.length + 1;
  textareaEl.selectionEnd = beforeSelection.length + selection.length + 1;
}

export { readTextarea, writeTextarea };
