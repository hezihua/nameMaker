import { pinyin } from "pinyin-pro";

export interface PhoneticReport {
  ok: boolean;
  score: number;
  notes: string[];
}

function toneOf(char: string): number | null {
  const py = pinyin(char, { toneType: "num", type: "array" });
  const s = py[0];
  if (!s) return null;
  const m = s.match(/([1-5])/);
  return m ? Number(m[1]) : null;
}

function initialOf(char: string): string {
  const py = pinyin(char, { pattern: "initial", type: "array" });
  return (py[0] || "").toLowerCase();
}

function finalOf(char: string): string {
  const py = pinyin(char, { pattern: "final", type: "array" });
  return (py[0] || "").toLowerCase();
}

/** 字典：音律起伏、声母韵母、连上声 */
export function evaluatePhonetics(fullName: string): PhoneticReport {
  const chars = [...fullName].filter((c) => /\p{Script=Han}/u.test(c));
  const notes: string[] = [];
  let score = 100;

  if (chars.length < 2) {
    return { ok: true, score, notes: ["单姓或单名，音律从简。"] };
  }

  const tones = chars.map((c) => toneOf(c));
  const initials = chars.map((c) => initialOf(c));
  const finals = chars.map((c) => finalOf(c));

  const uniqueTones = new Set(tones.filter((t) => t != null));
  if (uniqueTones.size <= 1) {
    score -= 25;
    notes.push("声调缺少起伏，念读略平。");
  }

  for (let i = 0; i < chars.length - 1; i++) {
    if (tones[i] === 3 && tones[i + 1] === 3) {
      score -= 20;
      notes.push(`「${chars[i]}${chars[i + 1]}」连续上声，易听混。`);
    }
    if (initials[i] && initials[i] === initials[i + 1]) {
      score -= 12;
      notes.push(`相邻字声母相同（${initials[i]}），略拗口。`);
    }
    if (finals[i] && finals[i] === finals[i + 1]) {
      score -= 8;
      notes.push(`相邻字韵母相同，缺少变化。`);
    }
    const a = initials[i];
    const b = initials[i + 1];
    if (
      (a === "z" && b === "zh") ||
      (a === "zh" && b === "z") ||
      (a === "c" && b === "ch") ||
      (a === "ch" && b === "c") ||
      (a === "s" && b === "sh") ||
      (a === "sh" && b === "s")
    ) {
      score -= 6;
      notes.push("相邻字平翘舌声母接近，念读不够清朗。");
    }
  }

  const ok = score >= 60;
  if (notes.length === 0) {
    notes.push("音律有起伏，符合字典建议。");
  }
  return { ok, score: Math.max(0, score), notes };
}

/** 简单谐音风险提示（全名） */
export function homophoneWarnings(fullName: string): string[] {
  const py = pinyin(fullName, { toneType: "none", separator: "" }).toLowerCase();
  const bad: { sub: string; msg: string }[] = [
    { sub: "wuqing", msg: "谐音「无情」" },
    { sub: "daomei", msg: "谐音「倒霉」" },
    { sub: "qiongkun", msg: "谐音「穷困」" },
  ];
  const out: string[] = [];
  for (const b of bad) {
    if (py.includes(b.sub)) out.push(b.msg);
  }
  return out;
}
