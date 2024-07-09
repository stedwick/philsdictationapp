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

type PunctuationMachineContext = {
  before: string;
  text: string;
  after: string;
}

export const punctuationMachine = setup({
  types: {
    input: {} as PunctuationMachineContext,
    context: {} as PunctuationMachineContext,
  },
}).createMachine({
  context: ({ input }) => input,
  id: "Punctuator",
  initial: "punctuating",
  states: {
    punctuating: {
      type: "final",
      entry: [
        // trim
        assign({
          text: ({ context: { text } }) => text.trim(),
        }),
        ({ context: { text } }) => console.log(text),
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
            return text.replace(new RegExp(`([${charsWithOnlySpaceBefore}])\s+`, "gi"), "$1");
          }
        }),
        ({ context: { text } }) => console.log(text),
        // charsWithOnlySpaceAfter
        assign({
          text: ({ context: { text } }) => {
            return text.replace(new RegExp(`\s+([${charsWithOnlySpaceAfter}])`, "gi"), "$1");
          }
        }),
        ({ context: { text } }) => console.log(text),
      ],
    },
  },
});
