type InsertOpts = {
  selectInsertedText?: boolean;
  allowEmptyString?: boolean;
};

export class TextareaUtils {
  readonly textareaRef: React.RefObject<HTMLTextAreaElement>;
  // without interimTranscript
  currentInsertedText = "";
  currentValue = "";
  currentSelectionStart = 0;
  currentSelectionEnd = 0;
  // after finalTranscript
  previousInsertedText = "";
  previousValue = "";
  previousSelectionStart = 0;
  previousSelectionEnd = 0;

  constructor(textareaRef: React.RefObject<HTMLTextAreaElement>) {
    this.textareaRef = textareaRef;
  }

  get textarea() {
    return this.textareaRef.current as HTMLTextAreaElement;
  }

  valuesBeforeAndAfterCursorSelection() {
    const value = this.textarea.value;
    const beforeCursor = value.substring(0, this.textarea.selectionStart);
    const afterCursor = value.substring(
      this.textarea.selectionEnd,
      value.length
    );
    return [beforeCursor, afterCursor];
  }

  spaceIsNeededAfter() {
    const [, afterCursor] = this.valuesBeforeAndAfterCursorSelection();
    if (afterCursor.length > 0) {
      return afterCursor.search(/^[\w]/) >= 0;
    }
    return false;
  }

  spaceIsNeededBefore() {
    const [beforeCursor] = this.valuesBeforeAndAfterCursorSelection();
    if (beforeCursor.length > 0) {
      return beforeCursor.search(/[\s]$/) == -1;
    }
    return false;
  }

  insertAtCursor(text: string, userOpts: InsertOpts = {}) {
    const opts = {
      selectInsertedText: false,
      allowEmptyString: false,
      ...userOpts,
    };
    if (text.length == 0 && !opts.allowEmptyString) return;

    if (this.spaceIsNeededBefore()) {
      text = " " + text;
    }
    if (this.spaceIsNeededAfter()) {
      text = text + " ";
    }
    text = text.replace(/^\s+/, " ");
    text = text.replace(/\s+$/, " ");

    // previous values; interim doesn't count
    if (!opts.selectInsertedText) {
      this.previousInsertedText = this.currentInsertedText;
      this.previousValue = this.currentValue;
      this.previousSelectionStart = this.currentSelectionStart;
      this.previousSelectionEnd = this.currentSelectionEnd;
      console.log("previousValue", this.previousValue);
    }

    const [beforeCursor, afterCursor] =
      this.valuesBeforeAndAfterCursorSelection();
    this.textarea.value = beforeCursor + text + afterCursor;

    const cursorPosition = beforeCursor.length + text.length;
    this.textarea.blur(); // to scroll to cursor position
    this.textarea.setSelectionRange(cursorPosition, cursorPosition);
    this.textarea.focus();
    if (opts.selectInsertedText) {
      this.textarea.setSelectionRange(beforeCursor.length, cursorPosition);
    }

    // current values; interim doesn't count
    if (!opts.selectInsertedText) {
      this.currentInsertedText = text;
      this.currentValue = this.textarea.value;
      this.currentSelectionStart = this.textarea.selectionStart;
      this.currentSelectionEnd = this.textarea.selectionEnd;
      console.log("currentValue", this.currentValue);
    }
  }

  undoCurrentInsert() {
    this.textarea.value = this.currentValue;
    this.textarea.setSelectionRange(
      this.currentSelectionStart,
      this.currentSelectionEnd
    );
  }

  undoPreviousInsert() {
    this.textarea.value = this.previousValue;
    this.textarea.setSelectionRange(
      this.previousSelectionStart,
      this.previousSelectionEnd
    );
  }
}
