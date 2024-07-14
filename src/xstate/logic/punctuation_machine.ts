import { assign, setup } from "xstate";

const punctuationMap: Record<string, string> = {
  // TODO: all keyboard punctuation
  comma: ",",
  period: ".",
  colon: ":",
  semicolon: ";",
  hyphen: "-",
  // "en dash": "–",
  "question mark": "?",
  "exclamation mark": "!",
  "open parentheses": "(",
  "close parentheses": ")",
  "new paragraph": "\n\n",
};

const punctuationRegex = new RegExp(
  // Why does \b have to be escaped inside single quotes?
  '\\b(' + Object.keys(punctuationMap).join('|') + ')\\b',
  "gi"
);
window.regex = punctuationRegex;

// Should I replace spaces around -?
const charsWithNoSpaces = "-";

const charsWithOnlySpaceBefore = "(";
const charsWithOnlySpaceAfter = ",.:;?!)";
const charsThatCapitalizeNext = ".?!\\\n";
// const charsWithSpaceBeforeAndAfter = "–";

// FIXME: space OR beginning of line
const charsWithOnlySpaceBeforeRegex = new RegExp(`([${charsWithOnlySpaceBefore}])\\s+`, "g");
const charsWithOnlySpaceAfterRegex = new RegExp(`\\s+([${charsWithOnlySpaceAfter}])`, "g");
const charsThatCapitalizeNextRegex = new RegExp(`([${charsThatCapitalizeNext}]\\W+)(\\w)`, "g");

const capitalizeNextRegex = new RegExp(`(^|[${charsThatCapitalizeNext}])\\W*$`);
const spaceComesNextRegex = new RegExp(`[^\\s${charsWithOnlySpaceBefore}${charsWithNoSpaces}]$`);
const spaceComesBeforeRegex = new RegExp(`^[^${charsWithOnlySpaceAfter}]`);
// window.regex = capitalizeNextRegex;

type PunctuationMachineContext = {
  before: string;
  text: string;
  after: string;
  // numCharsPaddedBefore?: number;
  // numCharsPaddedAfter?: number;
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
      // The order below is very important.
      entry: [
        // trim
        assign({
          text: ({ context: { text } }) => text.trim(),
        }),

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

        // Special rules
        assign({
          text: ({ context: { text } }) => {
            // These have special spacing rules, and it matters if they are left or right, so we can't use the map above.
            // Open and close quotes
            text = text.replace(/new[ -]quotation\s*/gi, '"');
            text = text.replace(/\s*end[ -]quotation/gi, '"');
            // Apostrophe s
            text = text.replace(/\s*apostrophe(s| s)?/gi, "'s");
            return text;
          }
        }),
        ({ context: { text } }) => console.log("special's: [", text, "]"),

        // Capitalize the first letter of each sentence
        assign({
          text: ({ context: { before, text } }) => {
            if (before === '' || before.match(capitalizeNextRegex)) {
              return text.replace(/^\W*(\w)/, (char) => char.toUpperCase());
            } else {
              return text;
            }
          }
        }),
        ({ context: { text } }) => console.log("cap 1st: [", text, "]"),

        // Capitalize within utterance (saying two sentences with a period in one breath)
        assign({
          text: ({ context: { text } }) => {
            return text.replace(charsThatCapitalizeNextRegex, (_match, p1, p2) => (p1 + p2.toUpperCase()));
          }
        }),
        ({ context: { text } }) => console.log("end. cap: [", text, "]"),

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

        // Trim multi-line
        assign({
          text: ({ context: { text } }) => {
            // We have to trim spaces but not include new lines in \s
            return text.replace(/[^\S\n]*(\n+)[^\S\n]*/g, "$1");
          }
        }),
        ({ context: { text } }) => console.log("_trim_ [", text, "]"),

        // TODO: capitalize the first letter of each sentence AND line
        // TODO: Special exceptions, a.m. and p.m.
        // FIXME: punc edge cases
      ],
    },
  },
});

// Is padding a problem?
// Pad text with the last/first non-space characters from before and after.
// This affects punctuation, for example:
// "...end." + text + "(and..."
//
// assign(({ context: { before, text, after } }) => {
//   const padBefore = before.match(/[^\s]*\s*$/)?.[0] || "";
//   const padAfter = after.match(/^\s*[^\s]*/)?.[0] || "";
//   return {
//     text: padBefore + text + padAfter,
//     numCharsPaddedBefore: padBefore.length,
//     numCharsPaddedAfter: padAfter.length,
//   };
// }),
// ({ context: { text } }) => console.log("<pad>: [", text, "]"),

