import raw from "@/data/dictionary.json";
import type { Wuxing } from "./types";
import {
  allowedComboKeys,
  charWuxingDrainsFavorite,
  charWuxingSupportsFavorite,
  comboKeyForChars,
  pairWuxingValid,
  TABOO_CHARS,
} from "./naming-rules";

export interface DictChar {
  char: string;
  wuxing: Wuxing;
  strokes: number | null;
  combinations: Record<string, string[]>;
}

export interface DictionaryData {
  source: string;
  charCount: number;
  chars: Record<string, DictChar>;
}

const data = raw as DictionaryData;

export function getDictionary(): DictionaryData {
  return data;
}

export function getDictChar(ch: string): DictChar | undefined {
  const rec = data.chars[ch];
  if (!rec) return undefined;
  return { ...rec, wuxing: rec.wuxing as Wuxing };
}

export function lookupWuxing(ch: string): Wuxing | undefined {
  return getDictChar(ch)?.wuxing;
}

export function lookupStrokes(ch: string): number | null {
  return getDictChar(ch)?.strokes ?? null;
}

const presetCache = new Map<
  Wuxing,
  { given: string; anchor: string; combo: string }[]
>();

/** 从字典预设组合生成双字名（给定名部分） */
export function presetGivenNamesForFavorite(
  favorite: Wuxing,
  limit = 800,
): { given: string; anchor: string; combo: string }[] {
  const cached = presetCache.get(favorite);
  if (cached && cached.length >= limit) {
    return cached.slice(0, limit);
  }

  const allowed = new Set(allowedComboKeys(favorite));
  const out: { given: string; anchor: string; combo: string }[] = [];
  const seen = new Set<string>();

  for (const rec of Object.values(data.chars)) {
    const wx = rec.wuxing as Wuxing;
    if (TABOO_CHARS.has(rec.char)) continue;
    for (const [combo, partners] of Object.entries(rec.combinations)) {
      if (!allowed.has(combo)) continue;
      const [w1, w2] = [combo[0] as Wuxing, combo[1] as Wuxing];
      if (!pairWuxingValid(w1, w2, favorite)) continue;
      for (const p of partners) {
        if (TABOO_CHARS.has(p)) continue;
        const partner = getDictChar(p);
        if (!partner) continue;
        const pwx = partner.wuxing as Wuxing;
        const given = rec.char + p;
        const givenRev = p + rec.char;
        for (const g of [given, givenRev]) {
          if (seen.has(g)) continue;
          const c0 = getDictChar(g[0])?.wuxing as Wuxing | undefined;
          const c1 = getDictChar(g[1])?.wuxing as Wuxing | undefined;
          if (!c0 || !c1) continue;
          if (!pairWuxingValid(c0, c1, favorite)) continue;
          if (
            charWuxingDrainsFavorite(c0, favorite) ||
            charWuxingDrainsFavorite(c1, favorite)
          )
            continue;
          seen.add(g);
          out.push({ given: g, anchor: rec.char, combo });
          if (out.length >= limit) {
            presetCache.set(favorite, out);
            return out;
          }
        }
      }
    }
  }
  presetCache.set(favorite, out);
  return out;
}

export function singleCharCandidates(favorite: Wuxing): DictChar[] {
  return Object.values(data.chars).filter((rec) => {
    if (TABOO_CHARS.has(rec.char)) return false;
    const wx = rec.wuxing as Wuxing;
    return (
      charWuxingSupportsFavorite(wx, favorite) &&
      !charWuxingDrainsFavorite(wx, favorite)
    );
  });
}

export function validateGivenNameWuxing(
  given: string,
  favorite: Wuxing,
): boolean {
  const chars = [...given];
  if (chars.length === 0) return false;
  if (chars.some((c) => TABOO_CHARS.has(c))) return false;

  const wxList = chars.map((c) => lookupWuxing(c)).filter(Boolean) as Wuxing[];
  if (wxList.length !== chars.length) return false;

  for (const wx of wxList) {
    if (!charWuxingSupportsFavorite(wx, favorite)) return false;
    if (charWuxingDrainsFavorite(wx, favorite)) return false;
  }

  if (wxList.length === 1) return true;

  for (let i = 0; i < wxList.length - 1; i++) {
    if (
      wxList[i] !== wxList[i + 1] &&
      !pairWuxingValid(wxList[i], wxList[i + 1], favorite)
    ) {
      return false;
    }
  }
  return true;
}

export function comboLabel(given: string): string | null {
  if (given.length !== 2) return null;
  const w1 = lookupWuxing(given[0]);
  const w2 = lookupWuxing(given[1]);
  if (!w1 || !w2) return null;
  return comboKeyForChars(w1, w2);
}
