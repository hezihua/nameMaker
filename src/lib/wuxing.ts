import type { Wuxing } from "./types";

export const WUXING_ORDER: Wuxing[] = ["木", "火", "土", "金", "水"];

export const GAN_WUXING: Record<string, Wuxing> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

export const ZHI_MAIN_WUXING: Record<string, Wuxing> = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

/** 月令季节对日主的旺衰（简化） */
const SEASON_SUPPORT: Record<string, Wuxing[]> = {
  寅: ["木"],
  卯: ["木"],
  辰: ["木", "土"],
  巳: ["火"],
  午: ["火"],
  未: ["火", "土"],
  申: ["金"],
  酉: ["金"],
  戌: ["金", "土"],
  亥: ["水"],
  子: ["水"],
  丑: ["水", "土"],
};

export function emptyWuxingCount(): Record<Wuxing, number> {
  return { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
}

export function wuxingGenerates(from: Wuxing): Wuxing {
  const map: Record<Wuxing, Wuxing> = {
    木: "火",
    火: "土",
    土: "金",
    金: "水",
    水: "木",
  };
  return map[from];
}

export function wuxingGeneratedBy(target: Wuxing): Wuxing {
  const map: Record<Wuxing, Wuxing> = {
    木: "水",
    火: "木",
    土: "火",
    金: "土",
    水: "金",
  };
  return map[target];
}

export function wuxingOvercomes(from: Wuxing): Wuxing {
  const map: Record<Wuxing, Wuxing> = {
    木: "土",
    火: "金",
    土: "水",
    金: "木",
    水: "火",
  };
  return map[from];
}

export function wuxingOvercomeBy(target: Wuxing): Wuxing {
  const map: Record<Wuxing, Wuxing> = {
    木: "金",
    火: "水",
    土: "木",
    金: "火",
    水: "土",
  };
  return map[target];
}

export function monthSupportsDayMaster(
  monthZhi: string,
  dayMaster: Wuxing,
): boolean {
  const supported = SEASON_SUPPORT[monthZhi] ?? [];
  return supported.includes(dayMaster);
}

export function wuxingLabel(w: Wuxing): string {
  const colors: Record<Wuxing, string> = {
    木: "木（生发）",
    火: "火（光明）",
    土: "土（承载）",
    金: "金（刚毅）",
    水: "水（智慧）",
  };
  return colors[w];
}
