import { ZH_DICT, ZH_MAX_LEN } from "./dictionary.ts";
import { normalizeTerm } from "./normalize.ts";
import { stemEnglish } from "./stemmer.ts";
import { isStopword } from "./stopwords.ts";
import type { Token, TokenKind } from "./types.ts";

const SPAN =
  /[A-Za-z_][A-Za-z0-9_]*(?:'[A-Za-z]+)?|[0-9]+(?:\.[0-9]+)?%?|[\u3400-\u9fff\uf900-\ufaff]+/g;

function fmm(span: string): { raw: string; start: number }[] {
  const out: { raw: string; start: number }[] = [];
  let i = 0;
  while (i < span.length) {
    const end = Math.min(span.length, i + ZH_MAX_LEN);
    let hit = 1;
    for (let j = end; j > i; j--) {
      const piece = span.slice(i, j);
      if (j === i + 1 || ZH_DICT.has(piece)) {
        hit = j - i;
        break;
      }
    }
    out.push({ raw: span.slice(i, i + hit), start: i });
    i += hit;
  }
  return out;
}

function kindOf(raw: string): TokenKind {
  if (/^[0-9]/.test(raw)) return "number";
  if (/^[A-Za-z_]/.test(raw)) return "latin";
  return "cjk";
}

function toTerm(raw: string, kind: TokenKind): string {
  if (kind === "latin") return stemEnglish(raw.toLowerCase().replace(/%$/, ""));
  const stripped = raw.replace(/%$/, "");
  return normalizeTerm(stripped);
}

export interface TokenizeOptions {
  dropStopwords?: boolean;
  subword?: boolean;
}

function pushToken(
  tokens: Token[],
  raw: string,
  start: number,
  kind: TokenKind,
  dropStopwords: boolean,
  subword: boolean,
) {
  const term = toTerm(raw, kind);
  const stopped = isStopword(raw) || isStopword(term);
  if (dropStopwords && stopped) return;
  tokens.push({
    raw,
    term,
    start,
    end: start + raw.length,
    kind,
    stopped,
    subword,
  });
}

export function tokenize(text: string, opts: TokenizeOptions = {}): Token[] {
  const dropStopwords = opts.dropStopwords ?? true;
  const subword = opts.subword ?? false;
  const tokens: Token[] = [];
  SPAN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = SPAN.exec(text))) {
    const span = m[0];
    const spanStart = m.index;
    const kind = kindOf(span);
    if (kind === "cjk") {
      for (const piece of fmm(span)) {
        const raw = piece.raw;
        const start = spanStart + piece.start;
        pushToken(tokens, raw, start, "cjk", dropStopwords, false);
        if (subword && raw.length >= 2) {
          const emitted = new Set<string>([raw]);
          for (let i = 0; i < raw.length; i++) {
            for (let j = i + 2; j <= raw.length; j++) {
              const gram = raw.slice(i, j);
              if (emitted.has(gram)) continue;
              const dictHit = ZH_DICT.has(gram);
              const isBigram = gram.length === 2;
              if (!dictHit && !isBigram) continue;
              emitted.add(gram);
              pushToken(tokens, gram, start + i, "cjk", dropStopwords, true);
            }
          }
        }
      }
    } else {
      pushToken(tokens, span, spanStart, kind, dropStopwords, false);
    }
  }
  return tokens;
}

export function uniqueTerms(tokens: Token[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tokens) {
    if (!t.term) continue;
    if (seen.has(t.term)) continue;
    seen.add(t.term);
    out.push(t.term);
  }
  return out;
}

/** Three cuts the video walks through for 自然语言处理. */
export function previewCuts(
  text: string,
  locale: "zh" | "en" = "zh",
): { label: string; hint: string; tokens: string[] }[] {
  const smart = tokenize(text, { dropStopwords: false, subword: false })
    .filter((t) => !t.subword)
    .map((t) => t.raw);
  const max = tokenize(text, { dropStopwords: false, subword: true }).map((t) =>
    t.subword ? `${t.raw}*` : t.raw,
  );
  const chars = [...text].filter((c) => /\S/.test(c));
  if (locale === "en") {
    return [
      { label: "Forward Max Match (FMM)", hint: "Full words preferred; must match query analyzer", tokens: smart },
      { label: "Search Engine (w/ Subwords)", hint: "Recalls both the full phrase and subwords like '语言'", tokens: max },
      { label: "Character-by-Character", hint: "Different segmentation produces completely different recall", tokens: chars },
    ];
  }
  return [
    { label: "正向最大匹配", hint: "整词优先，和查询必须同一套", tokens: smart },
    { label: "搜索引擎（含子词）", hint: "整词能搜到，单独搜「语言」也能命中", tokens: max },
    { label: "逐字", hint: "切法一变，检索结果就变", tokens: chars },
  ];
}
