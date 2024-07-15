import type { TaterContext } from "../types/tater_context";

const readTextarea = ({ textareaEl }: { textareaEl: HTMLTextAreaElement }) => ({
  value: textareaEl.value,
  beforeSelection: textareaEl.value.substring(0, textareaEl.selectionStart),
  selection: textareaEl.value.substring(textareaEl.selectionStart, textareaEl.selectionEnd),
  afterSelection: textareaEl.value.substring(textareaEl.selectionEnd, textareaEl.textLength),
});

function writeTextarea({ context: { textareaNewValues, textareaEl } }: { context: TaterContext }) {
  const currentValues = readTextarea({ textareaEl });

  const beforeSelection =
    textareaNewValues.beforeSelection || currentValues.beforeSelection;
  const selection = textareaNewValues.selection || currentValues.selection;
  const afterSelection =
    textareaNewValues.afterSelection || currentValues.afterSelection;

  textareaEl.value = beforeSelection + selection + afterSelection;

  textareaEl.selectionStart = beforeSelection.length + selection.length;
  textareaEl.selectionEnd = beforeSelection.length + selection.length;
}

function selectNewText({ context: { textareaCurrentValues, textareaNewValues: { beforeSelection, selection }, textareaEl } }: { context: TaterContext }) {
  // MAYBE: Worry about blank "" strings?
  textareaEl.selectionStart = (beforeSelection || textareaCurrentValues.beforeSelection).length;
  textareaEl.selectionEnd = (beforeSelection || textareaCurrentValues.beforeSelection).length + (selection || "").length;
}

export { readTextarea, writeTextarea, selectNewText };
