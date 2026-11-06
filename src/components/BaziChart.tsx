"use client";

import type { BaziAnalysis } from "@/lib/types";
import { WUXING_ORDER } from "@/lib/wuxing";

const WUXING_BAR: Record<string, string> = {
  木: "bg-emerald-500",
  火: "bg-orange-500",
  土: "bg-amber-600",
  金: "bg-slate-400",
  水: "bg-sky-500",
};

export function BaziChart({ analysis }: { analysis: BaziAnalysis }) {
  const max = Math.max(...WUXING_ORDER.map((w) => analysis.wuxingCount[w]), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {analysis.pillars.map((p) => (
          <div
            key={p.label}
            className="rounded-xl border border-stone-200/80 bg-white/70 p-4 text-center shadow-sm backdrop-blur"
          >
            <div className="text-xs tracking-widest text-stone-500">
              {p.label}柱
            </div>
            <div className="mt-2 font-serif text-2xl tracking-wider text-stone-900">
              {p.ganZhi}
            </div>
            <div className="mt-1 text-xs text-stone-500">{p.wuxing}</div>
            <div className="mt-1 text-[11px] text-stone-400">{p.naYin}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-stone-200/80 bg-white/70 p-5 shadow-sm backdrop-blur">
        <h3 className="font-serif text-lg text-stone-800">五行分布（加权）</h3>
        <div className="mt-4 space-y-3">
          {WUXING_ORDER.map((w) => {
            const val = analysis.wuxingCount[w];
            const pct = Math.round((val / max) * 100);
            return (
              <div key={w} className="flex items-center gap-3 text-sm">
                <span className="w-6 font-medium text-stone-700">{w}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={`h-full rounded-full ${WUXING_BAR[w]} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right tabular-nums text-stone-500">
                  {val.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
