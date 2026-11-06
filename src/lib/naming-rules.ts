import type { Wuxing } from "./types";
import {
  wuxingGenerates,
  wuxingOvercomeBy,
  wuxingOvercomes,
} from "./wuxing";

/** 《简易起名字典》：喜用 F 时名字用字允许的五行（单字） */
export function charWuxingSupportsFavorite(
  charWx: Wuxing,
  favorite: Wuxing,
): boolean {
  if (charWx === favorite) return true;
  if (wuxingGenerates(charWx) === favorite) return true;
  return false;
}

/** 用字不得克喜用、不得泄耗喜用（我生、我克类） */
export function charWuxingDrainsFavorite(
  charWx: Wuxing,
  favorite: Wuxing,
): boolean {
  if (wuxingOvercomeBy(charWx) === favorite) return true;
  if (wuxingGenerates(favorite) === charWx) return true;
  if (wuxingOvercomes(favorite) === charWx) return true;
  return false;
}

/** 两字名：五行无相克，且都补益喜用 */
export function pairWuxingValid(
  w1: Wuxing,
  w2: Wuxing,
  favorite: Wuxing,
): boolean {
  if (wuxingOvercomes(w1) === w2 || wuxingOvercomes(w2) === w1) return false;
  return (
    charWuxingSupportsFavorite(w1, favorite) &&
    charWuxingSupportsFavorite(w2, favorite)
  );
}

/** 喜用 F 时允许的五行组合键（与字典「水木组合」一致，顺序两种皆可） */
export function allowedComboKeys(favorite: Wuxing): string[] {
  const keys = new Set<string>();
  const wx: Wuxing[] = ["木", "火", "土", "金", "水"];
  for (const a of wx) {
    for (const b of wx) {
      if (pairWuxingValid(a, b, favorite)) {
        keys.add(a + b);
        keys.add(b + a);
      }
    }
  }
  return [...keys];
}

export function comboKeyForChars(
  w1: Wuxing,
  w2: Wuxing,
): string {
  return w1 + w2;
}

/** 避讳 / 寓意不佳用字（摘自字典说明） */
export const TABOO_CHARS = new Set([
  "疾",
  "病",
  "痛",
  "凶",
  "丧",
  "死",
  "伤",
  "残",
  "龘",
  "嚞",
]);
