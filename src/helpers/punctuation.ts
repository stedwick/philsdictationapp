const punctuationMap: Record<string, string> = {
  comma: ",",
  period: ".",
  colon: ":",
  // dash: "–",
  "question mark": "?",
  "exclamation mark": "!",
  vanita: "Fanita",
  vinita: "Fanita",
  benita: "Fanita",
  "my sink": "Syncta",
  "century plus": "SentryPlus",
  "new paragraph": "\n\n",
};

const punctuationRegex = new RegExp(
  Object.keys(punctuationMap).join("|"),
  // "\b" + Object.keys(punctuationMap).join("\b|\b") + "\b",
  "gi"
);

export default function punctuate(str: string) {
  // punctuate
  str = str.replace(punctuationRegex, function (matched: string) {
    const matchedLowerCase = matched.toLowerCase();
    const mappedValue = punctuationMap[matchedLowerCase];
    return mappedValue || matched;
  });

  // some punctuation has no space before (:,.)
  str = str.replace(/\s+([,.:?!])/gi, "$1");
  // quotes have special spacing rules
  str = str.replace(/open[ -]quote\s+/gi, '"');
  str = str.replace(/\s+close[ -]quote/gi, '"');
  // parentheses have special spacing rules
  str = str.replace(/open[ -]parentheses\s+/gi, "(");
  str = str.replace(/\s+close[ -]parentheses/gi, ")");
  str = str.replace(/\s+apostrophes/gi, "'s");

  // capitalize the first letter of each sentence
  str = str.replace(/^.*?\w|[.?!]\s.*?\w/gi, (letters) =>
    letters.toUpperCase()
  );
  str = str.replace(/^.*?(\w)/gim, (_letters, firstWordLetter) =>
    firstWordLetter.toUpperCase()
  );
  // I don't want the letter after a.m. or p.m. to be capitalized
  str = str.replace(/[ap]\.m\. \w|/gi, (ampmLetters) =>
    ampmLetters.toLowerCase()
  );
  // trim whitespace
  str = str.trim();
  return str;
}
