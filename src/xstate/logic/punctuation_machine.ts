import { assign, setup } from "xstate";

const punctuationMap: Record<string, string> = {
  // Basic punctuation
  comma: ",",
  period: ".",
  colon: ":",
  semicolon: ";",
  hyphen: "-",
  // "en dash": "–",
  "question mark": "?",
  "exclamation mark": "!",
  "exclamation point": "!",
  "open parentheses": "(",
  "close parentheses": ")",
  "new paragraph": "\n\n",

  // Advanced punctuation
  "tilde": "~",
  "backtick": "`",
  "at sign": "@",
  "hashtag": "#", // Chrome does this automatically
  "dollar sign": "$",
  "percent sign": "%",
  "carrot sign": "^", // misspelled haha
  "ampersand": "&",
  "asterisk": "*",
  "underscore": "_",
  "plus sign": "+",
  "forward slash": "/",
  "backslash": "\\",
  "less than sign": "<",
  "greater than sign": ">",
  "bar sign": "|",
  "pipe character": "|",
  "open bracket": "[",
  "close bracket": "]",
  "open brace": "{",
  "close brace": "}",
  "equal sign": "=",
  "ellipsis": "...",
  "trademark sign": "™",

  // Prices like $49.99 handled by Chrome
  // Emails like philip@gmail.com handled by Chrome
};

const smileyMap: Record<string, string> = {
  // Smileys
  "smiley face": ":)",
  "smiling face": ":)",
  "winky face": ";)",
  "winking face": ";)",
  "frowny face": ":(",
  "frowny-face": ":(",
  "frowning face": ":(",
  "tongue face": ":P",
  "tongue out face": ":P",
};

const punctuationRegex = new RegExp(
  // Why does \b have to be escaped inside single quotes?
  '\\b(' + Object.keys(punctuationMap).join('|') + ')\\b',
  "gi"
);
const smileyRegex = new RegExp(
  '\\b(' + Object.keys(smileyMap).join('|') + ')\\b',
  "gi"
);
// window.regex = punctuationRegex;

// Should I replace spaces around -?
const charsWithNoSpaces = "_\\-@/\\\\";

const charsWithOnlySpaceBefore = "(#$%{\\[";
const charsWithOnlySpaceAfter = ",.:;?!)}\\]™";
const charsThatCapitalizeNext = ".?!\\n";
// const charsWithSpaceBeforeAndAfter = "–";

const charsWithNoSpacesRegex = new RegExp(`\\s*([${charsWithNoSpaces}])\\s*`, "g");
const charsWithOnlySpaceBeforeRegex = new RegExp(`([${charsWithOnlySpaceBefore}])\\s+`, "g");
const charsWithOnlySpaceAfterRegex = new RegExp(`\\s+([${charsWithOnlySpaceAfter}])`, "g");
const charsThatCapitalizeNextRegex = new RegExp(`([${charsThatCapitalizeNext}]\\W+)(\\w)`, "g");

const capitalizeNextRegex = new RegExp(`(^|[${charsThatCapitalizeNext}])\\W*$`);
const spaceComesNextRegex = new RegExp(`[^\\s${charsWithOnlySpaceBefore}${charsWithNoSpaces}]$`);
const spaceComesBeforeRegex = new RegExp(`^[^${charsWithOnlySpaceAfter}]`);
// window.regex = capitalizeNextRegex;

const debugLog = import.meta.env.VITE_DEBUG === "true";

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
      // Fun sentence to test with from Claude AI:
      // "Wow! Can you believe it?! The package ($49.99 + taxes) arrived @ 3:30 p.m. - but it was empty... #disappointed :("
      entry: [
        // trim
        assign({
          text: ({ context: { text } }) => text.trim(),
        }),

        // Preserve special cases
        assign({
          text: ({ context: { text } }) => {
            text = text.replace(/a\.m\./g, "xxAAMMxx");
            text = text.replace(/p\.m\./g, "xxPPMMxx");
            return text;
          },
        }),
        ({ context: { text } }) => debugLog && console.log("A.M.P.M.: [", text, "]"),

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
        ({ context: { text } }) => debugLog && console.log("space .: [", text, "]"),

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
        ({ context: { text } }) => debugLog && console.log(". space: [", text, "]"),

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
        ({ context: { text } }) => debugLog && console.log("punc: [", text, "]"),

        // Special rules
        assign({
          text: ({ context: { text } }) => {
            // These have special spacing rules, and it matters if they are left or right, so we can't use the map above.
            // Open and close quotes
            text = text.replace(/start quotation\s*/gi, '"');
            text = text.replace(/\s*finish(ed)? quotation/gi, '"');
            // MAYBE: Single quotes?
            // Apostrophe s
            text = text.replace(/\s*apostrophe(s| s)?/gi, "'s");
            // Dash with spaces
            text = text.replace(/\bdash sign\b/gi, "–"); // en dash
            return text;
          }
        }),
        ({ context: { text } }) => debugLog && console.log("special's: [", text, "]"),

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
        ({ context: { text } }) => debugLog && console.log("cap 1st: [", text, "]"),

        // Capitalize within utterance (saying two sentences with a period in one breath)
        assign({
          text: ({ context: { text } }) => {
            return text.replace(charsThatCapitalizeNextRegex, (_match, p1, p2) => (p1 + p2.toUpperCase()));
          }
        }),
        ({ context: { text } }) => debugLog && console.log("end. cap: [", text, "]"),

        // charsWithOnlySpaceBefore
        assign({
          text: ({ context: { text } }) => {
            return text.replace(charsWithOnlySpaceBeforeRegex, "$1");
          }
        }),
        ({ context: { text } }) => debugLog && console.log("<space: [", text, "]"),

        // charsWithOnlySpaceAfter
        assign({
          text: ({ context: { text } }) => {
            return text.replace(charsWithOnlySpaceAfterRegex, "$1");
          }
        }),
        ({ context: { text } }) => debugLog && console.log("space> [", text, "]"),

        // charsWithNoSpacesRegex
        assign({
          text: ({ context: { text } }) => {
            return text.replace(charsWithNoSpacesRegex, "$1");
          }
        }),
        ({ context: { text } }) => debugLog && console.log("no@space [", text, "]"),

        // smileyRegex - Do this later so as not to confuse them with punctuation
        assign({
          text: ({ context: { text } }) => {
            return text.replace(smileyRegex, function(matched: string) {
              const matchedLowerCase = matched.toLowerCase();
              const mappedValue = smileyMap[matchedLowerCase];
              return mappedValue || matched;
            });
          }
        }),
        ({ context: { text } }) => debugLog && console.log(":) [", text, "]"),

        // Downcase hashtags
        assign({
          text: ({ context: { text } }) => text.replace(/#\w/g, (hashtag) => hashtag.toLowerCase())
        }),
        ({ context: { text } }) => debugLog && console.log("#low: [", text, "]"),

        // Put back special cases
        assign({
          text: ({ context: { text } }) => {
            text = text.replace(/xxAAMMxx/g, "a.m.");
            text = text.replace(/xxPPMMxx/g, "p.m.");
            return text;
          },
        }),
        ({ context: { text } }) => debugLog && console.log("a.m.p.m.: [", text, "]"),

        // Trim multi-line
        assign({
          text: ({ context: { text } }) => {
            // We have to trim spaces but not include new lines in \s
            return text.replace(/[^\S\n]*(\n+)[^\S\n]*/g, "$1");
          }
        }),
        ({ context: { text } }) => console.log("_trim_ [", text, "]"),

        // MAYBE: SUPER edge cases, not worrying about these for now
        // 3:30 p.m. -But it was tomorrow
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

