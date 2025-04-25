import { TaterContext } from "../types/tater_context";

function saveText({ context: { textareaCurrentValues } }: { context: TaterContext }) {
  localStorage.setItem("beforeSelection", textareaCurrentValues.beforeSelection);
  localStorage.setItem("selection", textareaCurrentValues.selection);
  localStorage.setItem("afterSelection", textareaCurrentValues.afterSelection);
}

function loadSavedText({ context: { textareaEl } }: { context: TaterContext }) {
  const before = localStorage.getItem("beforeSelection") || "";
  const selection = localStorage.getItem("selection") || "";
  const after = localStorage.getItem("afterSelection") || "";
  textareaEl.value = before + selection + after;
  textareaEl.selectionStart = before.length;
  textareaEl.selectionEnd = before.length + selection.length;
}

export { saveText, loadSavedText };
