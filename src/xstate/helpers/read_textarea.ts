const readTextareaValues = (el: HTMLTextAreaElement) => ({
  beforeSelection: el.value.substring(0, el.selectionStart),
  selection: el.value.substring(el.selectionStart, el.selectionEnd),
  afterSelection: el.value.substring(el.selectionEnd, el.textLength),
});

export default readTextareaValues;
