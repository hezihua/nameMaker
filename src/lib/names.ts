import type { BaziAnalysis, Gender, NameSuggestion, Wuxing } from "./types";
import {
  comboLabel,
  getDictChar,
  lookupStrokes,
  lookupWuxing,
  presetGivenNamesForFavorite,
  singleCharCandidates,
  validateGivenNameWuxing,
} from "./dictionary";
import { evaluatePhonetics, homophoneWarnings } from "./phonetics";
import { wuxingLabel } from "./wuxing";

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function strokeTotal(fullName: string): number | null {
  let sum = 0;
  let known = 0;
  for (const c of fullName) {
    const s = lookupStrokes(c);
    if (s == null) continue;
    sum += s;
    known++;
  }
  if (known === 0) return null;
  return sum;
}

function buildSuggestion(
  surname: string,
  given: string,
  favorite: Wuxing,
  source: "dictionary" | "generated",
): NameSuggestion | null {
  if (!validateGivenNameWuxing(given, favorite)) return null;

  const fullName = `${surname}${given}`;
  const phonetic = evaluatePhonetics(fullName);
  const homophones = homophoneWarnings(fullName);
  const strokes = strokeTotal(fullName);
  const combo = comboLabel(given);

  const chars = [...given].map((char) => {
    const rec = getDictChar(char);
    return {
      char,
      wuxing: (rec?.wuxing ?? lookupWuxing(char) ?? favorite) as Wuxing,
      meaning: rec ? `${rec.wuxing}行` : "",
      strokes: lookupStrokes(char),
    };
  });

  const wxSet = [...new Set(chars.map((c) => c.wuxing))];
  let reason = `《简易起名字典》${combo ? combo + "组合" : "五行"}，补益喜用「${favorite}」（${wxSet.map(wuxingLabel).join("、")}）。`;
  if (source === "dictionary") {
    reason += " 字与组合来自字典词条。";
  }
  reason += ` 音律分 ${phonetic.score}。`;
  if (strokes != null) reason += ` 总笔画约 ${strokes}。`;

  const phoneticNotes = [...phonetic.notes, ...homophones];

  let rankScore = phonetic.score;
  if (strokes != null) rankScore += Math.max(0, 40 - Math.floor(strokes / 2));
  if (combo) rankScore += 10;
  if (!phonetic.ok) rankScore -= 30;

  return {
    fullName,
    givenName: given,
    chars,
    reason,
    phoneticScore: phonetic.score,
    phoneticNotes,
    strokeTotal: strokes,
    wuxingCombo: combo,
    source,
    rankScore,
  };
}

export function generateNames(
  surname: string,
  _gender: Gender,
  analysis: BaziAnalysis,
  count = 20,
): NameSuggestion[] {
  const favorite = analysis.favorableElements[0];
  const seedBase = hashSeed(
    `${surname}-${analysis.pillars.map((p) => p.ganZhi).join("")}-${favorite}`,
  );

  const presets = presetGivenNamesForFavorite(favorite, 1200);
  const singles = singleCharCandidates(favorite);

  const candidates: NameSuggestion[] = [];

  for (let i = 0; i < presets.length; i++) {
    const idx = (seedBase + i * 13) % presets.length;
    const { given } = presets[idx];
    const s = buildSuggestion(surname, given, favorite, "dictionary");
    if (s) candidates.push(s);
    if (candidates.length >= count * 4) break;
  }

  for (let i = 0; i < singles.length && candidates.length < count * 5; i++) {
    const idx = (seedBase + i * 9) % singles.length;
    const given = singles[idx].char;
    const s = buildSuggestion(surname, given, favorite, "dictionary");
    if (s) candidates.push(s);
  }

  const seen = new Set<string>();
  const unique = candidates.filter((c) => {
    if (seen.has(c.fullName)) return false;
    seen.add(c.fullName);
    return true;
  });

  unique.sort((a, b) => (b.rankScore ?? 0) - (a.rankScore ?? 0));

  return unique.slice(0, count).map(({ rankScore: _, ...rest }) => rest);
}
