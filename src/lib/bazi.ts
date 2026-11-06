import { Lunar, Solar } from "lunar-javascript";
import type { BirthInput, BaziAnalysis, Pillar, WuxingCount } from "./types";
import {
  GAN_WUXING,
  ZHI_MAIN_WUXING,
  emptyWuxingCount,
  monthSupportsDayMaster,
  wuxingGeneratedBy,
  wuxingGenerates,
  wuxingOvercomeBy,
  wuxingOvercomes,
} from "./wuxing";
import type { Wuxing } from "./types";

function addCount(count: WuxingCount, w: Wuxing, weight: number) {
  count[w] += weight;
}

/** lunar-javascript 藏干可能是字符串或数组 */
function formatHideGan(hideGan: unknown): string {
  if (Array.isArray(hideGan)) {
    return hideGan.map((g) => String(g).trim()).filter(Boolean).join("，");
  }
  if (hideGan == null) return "";
  return String(hideGan);
}

function countFromGanZhi(
  count: WuxingCount,
  gan: string,
  zhi: string,
  hideGan: unknown,
) {
  const ganWx = GAN_WUXING[gan];
  if (ganWx) addCount(count, ganWx, 1);
  const zhiWx = ZHI_MAIN_WUXING[zhi];
  if (zhiWx) addCount(count, zhiWx, 0.6);
  formatHideGan(hideGan)
    .split(/[,，]/)
    .forEach((g) => {
      const h = GAN_WUXING[g.trim()];
      if (h) addCount(count, h, 0.25);
    });
}

function analyzeStrength(
  dayMaster: Wuxing,
  monthZhi: string,
  count: WuxingCount,
): boolean {
  let help = 0;
  let drain = 0;

  const support = wuxingGeneratedBy(dayMaster);
  const peer = dayMaster;
  const output = wuxingGenerates(dayMaster);
  const wealth = wuxingOvercomes(dayMaster);
  const officer = wuxingOvercomeBy(dayMaster);

  for (const w of ["木", "火", "土", "金", "水"] as Wuxing[]) {
    const n = count[w];
    if (w === peer || w === support) help += n;
    if (w === output || w === wealth || w === officer) drain += n;
  }

  if (monthSupportsDayMaster(monthZhi, dayMaster)) {
    help += 1.5;
  }

  return help >= drain;
}

function favorableElements(
  dayMaster: Wuxing,
  isStrong: boolean,
  count: WuxingCount,
): Wuxing[] {
  const primary = isStrong
    ? [
        wuxingGenerates(dayMaster),
        wuxingOvercomes(dayMaster),
        wuxingOvercomeBy(dayMaster),
      ]
    : [wuxingGeneratedBy(dayMaster), dayMaster];

  const sorted = ([...primary] as Wuxing[]).sort(
    (a, b) => count[a] - count[b],
  );

  const result: Wuxing[] = [];
  for (const w of sorted) {
    if (!result.includes(w)) result.push(w);
  }
  if (result.length < 2) {
    for (const w of ["木", "火", "土", "金", "水"] as Wuxing[]) {
      if (!result.includes(w) && count[w] <= 1) result.push(w);
      if (result.length >= 2) break;
    }
  }
  return result.slice(0, 2);
}

export function computeBazi(input: BirthInput): BaziAnalysis {
  const solar = Solar.fromYmdHms(
    input.year,
    input.month,
    input.day,
    input.hour,
    input.minute,
    0,
  );
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(input.daySect);

  const pillars: Pillar[] = [
    {
      label: "年",
      ganZhi: eightChar.getYear(),
      gan: eightChar.getYearGan(),
      zhi: eightChar.getYearZhi(),
      wuxing: eightChar.getYearWuXing(),
      naYin: eightChar.getYearNaYin(),
      hideGan: formatHideGan(eightChar.getYearHideGan()),
    },
    {
      label: "月",
      ganZhi: eightChar.getMonth(),
      gan: eightChar.getMonthGan(),
      zhi: eightChar.getMonthZhi(),
      wuxing: eightChar.getMonthWuXing(),
      naYin: eightChar.getMonthNaYin(),
      hideGan: formatHideGan(eightChar.getMonthHideGan()),
    },
    {
      label: "日",
      ganZhi: eightChar.getDay(),
      gan: eightChar.getDayGan(),
      zhi: eightChar.getDayZhi(),
      wuxing: eightChar.getDayWuXing(),
      naYin: eightChar.getDayNaYin(),
      hideGan: formatHideGan(eightChar.getDayHideGan()),
    },
    {
      label: "时",
      ganZhi: eightChar.getTime(),
      gan: eightChar.getTimeGan(),
      zhi: eightChar.getTimeZhi(),
      wuxing: eightChar.getTimeWuXing(),
      naYin: eightChar.getTimeNaYin(),
      hideGan: formatHideGan(eightChar.getTimeHideGan()),
    },
  ];

  const dayMasterGan = eightChar.getDayGan();
  const dayMaster = GAN_WUXING[dayMasterGan];
  if (!dayMaster) {
    throw new Error("无法解析日主天干");
  }

  const wuxingCount = emptyWuxingCount();
  for (const p of pillars) {
    countFromGanZhi(wuxingCount, p.gan, p.zhi, p.hideGan);
  }

  const isDayMasterStrong = analyzeStrength(
    dayMaster,
    pillars[1].zhi,
    wuxingCount,
  );
  const favorable = favorableElements(
    dayMaster,
    isDayMasterStrong,
    wuxingCount,
  );

  const strengthText = isDayMasterStrong ? "偏旺" : "偏弱";
  const summary = `日主为「${dayMasterGan}${dayMaster}」，综合月令与四柱五行，判定为${strengthText}。取名宜补${favorable.map((w) => `「${w}」`).join("、")}属性的字，以平衡命局。`;

  const namingTip = isDayMasterStrong
    ? "身强宜泄宜耗：名字五行宜同类或相生，且相生须补喜用，忌五行相克（参考《简易起名字典》）。"
    : "身弱宜生宜扶：名字宜补喜用同类或生喜用之五行；姓氏五行不必强求，如「李」属木。";

  return {
    pillars,
    lunarText: lunar.toString(),
    dayMaster,
    dayMasterGan,
    wuxingCount,
    isDayMasterStrong,
    favorableElements: favorable,
    summary,
    namingTip,
  };
}
