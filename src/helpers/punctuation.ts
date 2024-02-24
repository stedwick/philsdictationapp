const punctuationMap = {
  comma: ",",
  period: ".",
  colon: ":",
  "open quote": '"',
  "close quote": '"',
};

str =
  "open quote phenita apostrophes dog comma close quote named century plus comma is good dashboard period open quote phenita apostrophes dog comma close quote named century plus comma is good colon dashboard period";
str = str.replace(
  /\s*comma|\s*period|\s*colon|open quote\s*|\s*close quote/gi,
  function (matched) {
    for (const key in punctuationMap) {
      if (matched.includes(key)) return punctuationMap[key];
    }
  }
);

str = str.replace(/^.*?\w|\..*?\w/gi, (w) => w.toUpperCase());
str = str.trim();
