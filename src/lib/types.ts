export type Wuxing = "木" | "火" | "土" | "金" | "水";

export type Gender = "male" | "female" | "neutral";

export interface BirthInput {
  surname: string;
  gender: Gender;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** 1=早子时换日 2=晚子时换日（默认） */
  daySect: 1 | 2;
}

export interface Pillar {
  label: "年" | "月" | "日" | "时";
  ganZhi: string;
  gan: string;
  zhi: string;
  wuxing: string;
  naYin: string;
  hideGan: string;
}

export interface WuxingCount {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}

export interface BaziAnalysis {
  pillars: Pillar[];
  lunarText: string;
  dayMaster: Wuxing;
  dayMasterGan: string;
  wuxingCount: WuxingCount;
  isDayMasterStrong: boolean;
  favorableElements: Wuxing[];
  summary: string;
  namingTip: string;
}

export interface NameSuggestion {
  fullName: string;
  givenName: string;
  chars: {
    char: string;
    wuxing: Wuxing;
    meaning: string;
    strokes: number | null;
  }[];
  reason: string;
  phoneticScore: number;
  phoneticNotes: string[];
  strokeTotal: number | null;
  wuxingCombo: string | null;
  source: "dictionary" | "generated";
  /** 内部排序用，输出前可省略 */
  rankScore?: number;
}
