"use client";

import type { NameSuggestion } from "@/lib/types";

const WUXING_DOT: Record<string, string> = {
  木: "text-emerald-600",
  火: "text-orange-600",
  土: "text-amber-700",
  金: "text-slate-600",
  水: "text-sky-600",
};

export function NameList({ names }: { names: NameSuggestion[] }) {
  if (names.length === 0) {
    return (
      <p className="text-sm text-stone-500">暂无推荐，请调整条件后重试。</p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {names.map((n) => (
        <li
          key={n.fullName}
          className="group rounded-xl border border-stone-200/80 bg-white/80 p-4 shadow-sm transition hover:border-amber-300/80 hover:shadow-md"
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-serif text-2xl tracking-wide text-stone-900">
              {n.fullName}
            </span>
            <button
              type="button"
              className="shrink-0 rounded-md px-2 py-1 text-xs text-stone-500 opacity-0 transition group-hover:opacity-100 hover:bg-stone-100 hover:text-stone-800"
              onClick={() => navigator.clipboard?.writeText(n.fullName)}
            >
              复制
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-500">
            {n.wuxingCombo && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-900">
                {n.wuxingCombo}组合
              </span>
            )}
            <span className="rounded-full bg-stone-100 px-2 py-0.5">
              音律 {n.phoneticScore}
            </span>
            {n.strokeTotal != null && (
              <span className="rounded-full bg-stone-100 px-2 py-0.5">
                笔画约 {n.strokeTotal}
              </span>
            )}
            <span className="rounded-full bg-stone-100 px-2 py-0.5">
              {n.source === "dictionary" ? "字典词条" : "组合生成"}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {n.chars.map((c) => (
              <span
                key={c.char}
                className="inline-flex items-center gap-1 rounded-full bg-stone-50 px-2.5 py-0.5 text-xs text-stone-600"
              >
                <span className={`font-medium ${WUXING_DOT[c.wuxing]}`}>
                  {c.char}·{c.wuxing}
                  {c.strokes != null ? `·${c.strokes}画` : ""}
                </span>
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-stone-500">
            {n.reason}
          </p>
          {n.phoneticNotes.length > 0 && (
            <p className="mt-1 text-[11px] leading-relaxed text-stone-400">
              {n.phoneticNotes.join(" ")}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
