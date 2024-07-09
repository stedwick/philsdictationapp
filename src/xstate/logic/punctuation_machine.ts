import { assign, setup } from "xstate";

const punctuationMap: Record<string, string> = {
  // TODO all keyboard punctuation
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
  // TODO punctuation regex word boundaries
  // '\b' + Object.keys(punctuationMap).join('\b|\b') + '\b',
  "gi"
);

// const charsWithNoSpaces = "-";
const charsWithOnlySpaceBefore = "(";
const charsWithOnlySpaceAfter = ",.:;?!)";
// const charsWithSpaceBeforeAndAfter = "–";

// TODO space OR beginning of line
const charsWithOnlySpaceBeforeRegex = new RegExp(`([${charsWithOnlySpaceBefore}])\\s+`, "gi");
const charsWithOnlySpaceAfterRegex = new RegExp(`\\s+([${charsWithOnlySpaceAfter}])`, "gi");

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
        ({ context: { text } }) => console.log(text),

        // charsWithOnlySpaceBefore
        assign({
          text: ({ context: { text } }) => {
            return text.replace(charsWithOnlySpaceBeforeRegex, "$1");
          }
        }),
        ({ context: { text } }) => console.log(text),

        // charsWithOnlySpaceAfter
        assign({
          text: ({ context: { text } }) => {
            return text.replace(charsWithOnlySpaceAfterRegex, "$1");
          }
        }),
        ({ context: { text } }) => console.log(text),

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
        ({ context: { text } }) => console.log(text),
      ],
    },
  },
});
