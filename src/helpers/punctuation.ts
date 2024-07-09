import { TaterContext } from "../xstate/types/tater_context";

const punctuationMap: Record<string, string> = {
  comma: ",",
  period: ".",
  colon: ":",
  // dash: "–",
  "question mark": "?",
  "exclamation mark": "!",
  "new paragraph": "\n\n",
};

const punctuationRegex = new RegExp(
  Object.keys(punctuationMap).join("|"),
  // '\b' + Object.keys(punctuationMap).join('\b|\b') + '\b',
  "gi"
);

// TODO add spacing correctly
export default function punctuate(str: string) {
  // trim whitespace
  str = str.trim();

  // punctuate
  str = str.replace(punctuationRegex, function(matched: string) {
    const matchedLowerCase = matched.toLowerCase();
    const mappedValue = punctuationMap[matchedLowerCase];
    return mappedValue || matched;
  });

  // some punctuation has no space before (:,.)
  str = str.replace(/\s+([,.:?!])/gi, "$1");

  // These have special spacing rules, and it matters if they are left or right, so we can't use the map above.
  str = str.replace(/open[ -]quote\s+/gi, '"');
  str = str.replace(/\s+close[ -]quote/gi, '"');
  // parentheses
  str = str.replace(/open[ -]parentheses\s+/gi, "(");
  str = str.replace(/\s+close[ -]parentheses/gi, ")");
  // apostrophes
  str = str.replace(/\s+apostrophes?/gi, "'s");

  // capitalize the first letter of each sentence
  str = str.replace(/^.*?\w|[.?!]\s.*?\w/gim, (letters) =>
    letters.toUpperCase()
  );
  str = str.replace(/^.*?(\w)/gim, "$1");
  // str = str.replace(/^.*?(\w)/gim, (_letters, firstWordLetter) =>
  //   firstWordLetter.toUpperCase()
  // );

  // Special exceptions
  // I don't want the letter after a.m. or p.m. to be capitalized
  str = str.replace(/[ap]\.m\. \w|/gi, (ampmLetters) =>
    ampmLetters.toLowerCase()
  );

  return str;
}
type SpaceParams = {
  textareaCurrentValues: TaterContext["textareaCurrentValues"];
  newText: string | null;
};

const addSpacesBetweenSentences = ({ textareaCurrentValues, newText }: SpaceParams) => {
  newText ||= "";
  let retText = newText;

  if (!["", " ", "\n"].includes(textareaCurrentValues.beforeSelection.at(-1) || "")) {
    retText = " " + retText;
  };
  if (![".", ",", "?", "!", ":", "-", "", " ", "\n"].includes(textareaCurrentValues.afterSelection.at(0) || "")) {
    retText = retText + " ";
  };

  return retText;
};

export { addSpacesBetweenSentences };
