import { assign, setup } from "xstate";

const punctuationMap: Record<string, string> = {
  // TODO: all keyboard punctuation
  comma: ",",
  period: ".",
  colon: ":",
  semicolon: ";",
  hyphen: "-",
  // dash: "–",
  "question mark": "?",
  "exclamation mark": "!",
  "open parentheses": "(",
  "close parentheses": ")",
  "new paragraph": "\n\n",
};

const punctuationRegex = new RegExp(
  Object.keys(punctuationMap).join("|"),
  // FIXME: punctuation regex word boundaries
  // '\b' + Object.keys(punctuationMap).join('\b|\b') + '\b',
  "gi"
);

const charsWithNoSpaces = "-";
const charsWithOnlySpaceBefore = "(";
const charsWithOnlySpaceAfter = ",.:;?!)";
// const charsWithSpaceBeforeAndAfter = "–";

// FIXME: space OR beginning of line
const charsWithOnlySpaceBeforeRegex = new RegExp(`([${charsWithOnlySpaceBefore}])\\s+`, "gi");
const charsWithOnlySpaceAfterRegex = new RegExp(`\\s+([${charsWithOnlySpaceAfter}])`, "gi");

const capitalizeNextRegex = /[.!?]?$/;
const spaceComesNextRegex = new RegExp(`^[^\s${charsWithOnlySpaceAfter}${charsWithNoSpaces}]`);
const spaceComesBeforeRegex = new RegExp(`^[^${charsWithOnlySpaceAfter}]`);

type PunctuationMachineContext = {
  before: string;
  text: string;
  after: string;
}

export const punctuationMachine = setup({
  types: {
    input: {} as PunctuationMachineContext,
    context: {} as PunctuationMachineContext,
    output: {} as string,
  },
}).createMachine({
  context: ({ input }) => input,
  id: "Punctuator",
  initial: "punctuating",
  output: ({ context: { text } }) => text,
  states: {
    punctuating: {
      type: "final",
      entry: [
        // trim
        assign({
          text: ({ context: { text } }) => text.trim(),
        }),

        // punctuationRegex
        assign({
          text: ({ context: { text } }) => {
            return text.replace(punctuationRegex, function(matched: string) {
              const matchedLowerCase = matched.toLowerCase();
              const mappedValue = punctuationMap[matchedLowerCase];
              return mappedValue || matched;
            });
          }
        }),
        ({ context: { text } }) => console.log("punc: [", text, "]"),

        // charsWithOnlySpaceBefore
        assign({
          text: ({ context: { text } }) => {
            return text.replace(charsWithOnlySpaceBeforeRegex, "$1");
          }
        }),
        ({ context: { text } }) => console.log("<space: [", text, "]"),

        // charsWithOnlySpaceAfter
        assign({
          text: ({ context: { text } }) => {
            return text.replace(charsWithOnlySpaceAfterRegex, "$1");
          }
        }),
        ({ context: { text } }) => console.log("space> [", text, "]"),

        // Special rules
        assign({
          text: ({ context: { text } }) => {
            // These have special spacing rules, and it matters if they are left or right, so we can't use the map above.
            // Open and close quotes
            text = text.replace(/open[ -]quotation\s+/gi, '"');
            text = text.replace(/\s+close[ -]quotation/gi, '"');
            // Apostrophe s
            text = text.replace(/\s+apostrophe s/gi, "'s");
            return text;
          }
        }),
        ({ context: { text } }) => console.log("special's: [", text, "]"),

        // Capitalize the first letter of each sentence
        assign({
          text: ({ context: { before, text } }) => {
            if (before.match(capitalizeNextRegex)) {
              return text.replace(/^(.)/, (char) => char.toUpperCase());
            } else {
              return text;
            }
          }
        }),
        ({ context: { text } }) => console.log("cap 1st: [", text, "]"),

        // Capitalize within utterance (saying two sentences with a period in one breath)
        assign({
          text: ({ context: { text } }) => {
            return text.replace(/([.?!]\s+)(\w)/g, (_match, p1, p2) => (p1 + p2.toUpperCase()));
          }
        }),
        ({ context: { text } }) => console.log("end. cap: [", text, "]"),

        // Add space before sentence
        assign({
          text: ({ context: { before, text } }) => {
            if (before.match(spaceComesNextRegex)) {
              return " " + text;
            } else {
              return text;
            }
          }
        }),
        ({ context: { text } }) => console.log("space .: [", text, "]"),

        // Add space after sentence
        assign({
          text: ({ context: { text, after } }) => {
            if (after.match(spaceComesBeforeRegex)) {
              return text + " ";
            } else {
              return text;
            }
          }
        }),
        ({ context: { text } }) => console.log(". space: [", text, "]"),

        // TODO: capitalize the first letter of each sentence AND line
        // TODO: Special exceptions, a.m. and p.m.
        // FIXME: punc edge cases
      ],
    },
  },
});
