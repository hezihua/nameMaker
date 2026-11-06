"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { computeBazi } from "@/lib/bazi";
import { generateNames } from "@/lib/names";
import type { BirthInput, Gender, NameSuggestion } from "@/lib/types";
import { BaziChart } from "./BaziChart";
import { NameList } from "./NameList";

const defaultBirth: Omit<BirthInput, "surname" | "gender"> = {
  year: 2024,
  month: 6,
  day: 15,
  hour: 10,
  minute: 30,
  daySect: 2,
};

export function NameMakerApp() {
  const [surname, setSurname] = useState("李");
  const [gender, setGender] = useState<Gender>("neutral");
  const [birth, setBirth] = useState(defaultBirth);
  const [submitted, setSubmitted] = useState<BirthInput | null>(null);
  const [baziError, setBaziError] = useState<string | null>(null);
  const [names, setNames] = useState<NameSuggestion[]>([]);
  const [namesLoading, setNamesLoading] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  const analysis = useMemo(() => {
    if (!submitted) return null;
    try {
      return computeBazi(submitted);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [submitted]);

  useEffect(() => {
    if (!analysis || !submitted) {
      setNames([]);
      setNamesLoading(false);
      return;
    }
    setNamesLoading(true);
    setNames([]);
    const id = window.setTimeout(() => {
      try {
        setNames(generateNames(submitted.surname, submitted.gender, analysis));
      } finally {
        setNamesLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [analysis, submitted]);

  useEffect(() => {
    if (analysis && submitted) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysis, submitted]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = surname.trim();
    if (!trimmed) return;
    setBaziError(null);
    try {
      computeBazi({ surname: trimmed, gender, ...birth });
    } catch (e) {
      setBaziError(
        e instanceof Error ? e.message : "排盘失败，请检查出生时间是否有效。",
      );
      setSubmitted(null);
      return;
    }
    setSubmitted({
      surname: trimmed,
      gender,
      ...birth,
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="text-center">
        <p className="text-sm tracking-[0.35em] text-amber-800/80">八字取名</p>
        <h1 className="mt-2 font-serif text-4xl font-medium text-stone-900 sm:text-5xl">
          生辰起名
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-600">
          参考《简易起名字典》：排八字定喜用 → 按五行组合选字 → 校验音律与笔画。
          字库与预设组合来自字典 PDF 提取，供文化参考。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-10 rounded-2xl border border-stone-200/90 bg-white/85 p-6 shadow-lg shadow-stone-200/40 backdrop-blur sm:p-8"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block sm:col-span-1">
            <span className="text-sm font-medium text-stone-700">姓氏</span>
            <input
              required
              maxLength={2}
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2.5 font-serif text-lg outline-none ring-amber-700/30 focus:border-amber-600 focus:ring-2"
              placeholder="如：李"
            />
          </label>

          <fieldset className="sm:col-span-1">
            <legend className="text-sm font-medium text-stone-700">性别倾向</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["neutral", "不限"],
                  ["male", "男孩"],
                  ["female", "女孩"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGender(value)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    gender === value
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">出生年</span>
            <input
              type="number"
              min={1900}
              max={2100}
              required
              value={birth.year}
              onChange={(e) =>
                setBirth((b) => ({ ...b, year: Number(e.target.value) }))
              }
              className="mt-1.5 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-700/30"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-stone-700">月</span>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={birth.month}
                onChange={(e) =>
                  setBirth((b) => ({ ...b, month: Number(e.target.value) }))
                }
                className="mt-1.5 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-700/30"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-stone-700">日</span>
              <input
                type="number"
                min={1}
                max={31}
                required
                value={birth.day}
                onChange={(e) =>
                  setBirth((b) => ({ ...b, day: Number(e.target.value) }))
                }
                className="mt-1.5 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-700/30"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:col-span-2">
            <label className="block">
              <span className="text-sm font-medium text-stone-700">时（0–23）</span>
              <input
                type="number"
                min={0}
                max={23}
                required
                value={birth.hour}
                onChange={(e) =>
                  setBirth((b) => ({ ...b, hour: Number(e.target.value) }))
                }
                className="mt-1.5 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-700/30"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-stone-700">分</span>
              <input
                type="number"
                min={0}
                max={59}
                required
                value={birth.minute}
                onChange={(e) =>
                  setBirth((b) => ({ ...b, minute: Number(e.target.value) }))
                }
                className="mt-1.5 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-700/30"
              />
            </label>
          </div>

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-stone-700">
              子时换日（23 点后出生需留意）
            </span>
            <select
              value={birth.daySect}
              onChange={(e) =>
                setBirth((b) => ({
                  ...b,
                  daySect: Number(e.target.value) as 1 | 2,
                }))
              }
              className="mt-1.5 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-700/30"
            >
              <option value={2}>晚子时换日（23:00 后起算次日，常见）</option>
              <option value={1}>早子时换日（0:00 后起算当日）</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="mt-8 w-full rounded-xl bg-gradient-to-r from-amber-800 to-stone-800 py-3.5 font-medium text-amber-50 shadow-md transition hover:from-amber-900 hover:to-stone-900 sm:w-auto sm:px-10"
        >
          排盘并推荐名字
        </button>
      </form>

      {baziError && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {baziError}
        </p>
      )}

      {submitted && !analysis && !baziError && (
        <p className="mt-6 text-sm text-stone-500">正在生成命盘…</p>
      )}

      {analysis && submitted && (
        <section ref={resultsRef} className="mt-12 space-y-8">
          <div className="rounded-2xl border border-stone-200/80 bg-white/75 p-6 shadow-sm backdrop-blur sm:p-8">
            <h2 className="font-serif text-2xl text-stone-900">命盘解读</h2>
            <p className="mt-2 text-sm text-stone-500">{analysis.lunarText}</p>
            <p className="mt-4 leading-relaxed text-stone-700">
              {analysis.summary}
            </p>
            <p className="mt-2 text-sm text-stone-600">{analysis.namingTip}</p>
            <div className="mt-4 inline-flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
                喜用神：{analysis.favorableElements.join("、")}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700">
                日主：{analysis.dayMasterGan}
                {analysis.dayMaster}
              </span>
            </div>
            <div className="mt-8">
              <BaziChart analysis={analysis} />
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white/75 p-6 shadow-sm backdrop-blur sm:p-8">
            <h2 className="font-serif text-2xl text-stone-900">
              为「{submitted.surname}」姓推荐
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              组合来自《简易起名字典》词条；已按喜用五行、音律与笔画筛选，点击卡片可复制全名。
            </p>
            <div className="mt-6">
              {namesLoading ? (
                <p className="text-sm text-stone-500">
                  正在从字典组合名字（首次略慢，请稍候）…
                </p>
              ) : (
                <NameList names={names} />
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
