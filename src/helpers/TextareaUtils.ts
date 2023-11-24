export class TextareaUtils {
  readonly textareaRef: React.RefObject<HTMLTextAreaElement>;

  constructor(textareaRef: React.RefObject<HTMLTextAreaElement>) {
    this.textareaRef = textareaRef;
  }

  get textarea() {
    return this.textareaRef.current as HTMLTextAreaElement;
  }

  valuesBeforeAndAfterCursor() {
    const value = this.textarea.value;
    const beforeCursor = value.substring(0, this.textarea.selectionStart);
    const afterCursor = value.substring(
      this.textarea.selectionEnd,
      value.length
    );
    return [beforeCursor, afterCursor];
  }

  spaceIsNeededAfter() {
    const [, afterCursor] = this.valuesBeforeAndAfterCursor();
    if (afterCursor.length > 0) {
      return afterCursor.search(/^[\w]/) >= 0;
    }
    return false;
  }

  spaceIsNeededBefore() {
    const [beforeCursor] = this.valuesBeforeAndAfterCursor();
    if (beforeCursor.length > 0) {
      return beforeCursor.search(/[\s]$/) == -1;
    }
    return false;
  }

  insertAtCursor(text: string) {
    if (text.length == 0) return;
    if (this.spaceIsNeededBefore()) {
      text = " " + text;
    }
    if (this.spaceIsNeededAfter()) {
      text = text + " ";
    }
    text = text.replace(/^\s+/, " ");
    text = text.replace(/\s+$/, " ");
    const [beforeCursor, afterCursor] = this.valuesBeforeAndAfterCursor();
    this.textarea.value = beforeCursor + text + afterCursor;
    const cursorPosition = beforeCursor.length + text.length;
    this.textarea.setSelectionRange(cursorPosition, cursorPosition);
  }

  static insertAtCursor(myField: HTMLTextAreaElement, myValue: string) {
    let startPos = myField.selectionStart;
    let endPos = myField.selectionEnd;
    myField.value =
      myField.value.substring(0, startPos) +
      myValue +
      myField.value.substring(endPos, myField.value.length);
  }
}
