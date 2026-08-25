/**
 * Porter stemmer (step 1–5), compact. Enough for learning → learn,
 * algorithms → algorithm, and typical English IR demos.
 */
const C = "[^aeiou]";
const V = "[aeiouy]";
const CONSONANT_SEQ = `(${C}+)`;
const VOWEL_SEQ = `(${V}+)`;
const MGR0 = new RegExp(`^(${CONSONANT_SEQ})?${VOWEL_SEQ}${CONSONANT_SEQ}`);
const MEQ1 = new RegExp(
  `^(${CONSONANT_SEQ})?${VOWEL_SEQ}${CONSONANT_SEQ}(${VOWEL_SEQ})?$`,
);
const MGR1 = new RegExp(
  `^(${CONSONANT_SEQ})?${VOWEL_SEQ}${CONSONANT_SEQ}${VOWEL_SEQ}${CONSONANT_SEQ}`,
);
const VOWEL_IN_STEM = new RegExp(`^(${CONSONANT_SEQ})?${V}`);

function stem(word: string): string {
  if (word.length < 3) return word;
  let w = word.toLowerCase();
  if (w.startsWith("y")) w = `Y${w.slice(1)}`;

  // Step 1a
  if (w.endsWith("sses")) w = `${w.slice(0, -2)}`;
  else if (w.endsWith("ies")) w = `${w.slice(0, -2)}`;
  else if (w.endsWith("ss")) {
    /* keep */
  } else if (w.endsWith("s")) w = w.slice(0, -1);

  // Step 1b
  if (w.endsWith("eed")) {
    const stem1 = w.slice(0, -3);
    if (MGR0.test(stem1)) w = w.slice(0, -1);
  } else {
    const m1b = /^(.*?)(ed|ing)$/.exec(w);
    if (m1b && VOWEL_IN_STEM.test(m1b[1]!)) {
      w = m1b[1]!;
      if (/(at|bl|iz)$/.test(w)) w = `${w}e`;
      else if (/([^aeiouylsz])\1$/.test(w)) w = w.slice(0, -1);
      else if (/^([^aeiou][aeiouy][^aeiouwxy])$/.test(w)) w = `${w}e`;
    }
  }

  // Step 1c
  if (w.endsWith("y")) {
    const stemY = w.slice(0, -1);
    if (VOWEL_IN_STEM.test(stemY)) w = `${stemY}i`;
  }

  // Step 2
  const step2: [RegExp, string][] = [
    [/(ational)$/, "ate"],
    [/(tional)$/, "tion"],
    [/(enci)$/, "ence"],
    [/(anci)$/, "ance"],
    [/(izer)$/, "ize"],
    [/(abli)$/, "able"],
    [/(alli)$/, "al"],
    [/(entli)$/, "ent"],
    [/(eli)$/, "e"],
    [/(ousli)$/, "ous"],
    [/(ization)$/, "ize"],
    [/(ation)$/, "ate"],
    [/(ator)$/, "ate"],
    [/(alism)$/, "al"],
    [/(iveness)$/, "ive"],
    [/(fulness)$/, "ful"],
    [/(ousness)$/, "ous"],
    [/(aliti)$/, "al"],
    [/(iviti)$/, "ive"],
    [/(biliti)$/, "ble"],
    [/(logi)$/, "log"],
  ];
  for (const [re, repl] of step2) {
    const m = re.exec(w);
    if (m) {
      const stem2 = w.slice(0, -m[1]!.length);
      if (MGR0.test(stem2)) w = stem2 + repl;
      break;
    }
  }

  // Step 3
  const step3: [RegExp, string][] = [
    [/(icate)$/, "ic"],
    [/(ative)$/, ""],
    [/(alize)$/, "al"],
    [/(iciti)$/, "ic"],
    [/(ical)$/, "ic"],
    [/(ful)$/, ""],
    [/(ness)$/, ""],
  ];
  for (const [re, repl] of step3) {
    const m = re.exec(w);
    if (m) {
      const stem3 = w.slice(0, -m[1]!.length);
      if (MGR0.test(stem3)) w = stem3 + repl;
      break;
    }
  }

  // Step 4
  const step4 =
    /^(.*?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
  const m4 = step4.exec(w);
  if (m4) {
    if (MGR1.test(m4[1]!)) w = m4[1]!;
  } else {
    const m4b = /^(.*?)(s|t)(ion)$/.exec(w);
    if (m4b && MGR1.test(m4b[1]! + m4b[2])) w = m4b[1]! + m4b[2];
  }

  // Step 5
  if (w.endsWith("e")) {
    const stem5 = w.slice(0, -1);
    if (MGR1.test(stem5) || (MEQ1.test(stem5) && !/^([^aeiou][aeiouy][^aeiouwxy])$/.test(stem5))) {
      w = stem5;
    }
  }
  if (w.endsWith("ll") && MGR1.test(w)) w = w.slice(0, -1);

  if (w.startsWith("Y")) w = `y${w.slice(1)}`;
  return w;
}

export function stemEnglish(word: string): string {
  return stem(word);
}
