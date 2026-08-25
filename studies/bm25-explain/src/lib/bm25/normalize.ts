const CN_DIGIT: Record<string, string> = {
  零: "0",
  〇: "0",
  一: "1",
  二: "2",
  两: "2",
  三: "3",
  四: "4",
  五: "5",
  六: "6",
  七: "7",
  八: "8",
  九: "9",
};

const QUARTER: Record<string, string> = {
  第一季度: "q1",
  一季度: "q1",
  q1: "q1",
  第二季度: "q2",
  二季度: "q2",
  q2: "q2",
  第三季度: "q3",
  三季度: "q3",
  q3: "q3",
  第四季度: "q4",
  四季度: "q4",
  q4: "q4",
};

function cnYearToArabic(chunk: string): string | null {
  const m = /^([零〇一二两三四五六七八九]{2,4})年?$/.exec(chunk);
  if (!m) return null;
  const digits = [...m[1]!].map((c) => CN_DIGIT[c]).join("");
  if (!/^\d{2,4}$/.test(digits)) return null;
  return digits;
}

/** Canonical term used in the inverted index (query and docs share this). */
export function normalizeTerm(raw: string): string {
  const lower = raw.toLowerCase();
  if (QUARTER[raw] || QUARTER[lower]) return QUARTER[raw] ?? QUARTER[lower]!;

  const year = cnYearToArabic(raw);
  if (year) return year;

  const y2 = /^(\d{4})年$/.exec(raw);
  if (y2) return y2[1]!;

  return lower;
}
