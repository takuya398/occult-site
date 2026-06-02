"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GENRES } from "@/lib/experiences/types";
import { PREFECTURE_ORDER } from "@/constants/prefectures";
import { getUserKey } from "@/lib/userKey";

const PREFECTURES = ["", ...PREFECTURE_ORDER, "不明", "海外"] as const;

type SelectDownProps = {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
};

function SelectDown({ value, onChange, options, placeholder = "選択してください" }: SelectDownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const displayLabel = value || placeholder;
  const isPlaceholder = !value;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
      >
        <span className={isPlaceholder ? "text-zinc-500" : "text-zinc-100"}>{displayLabel}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={`shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-800 shadow-xl">
          {options.map((opt) => (
            <li
              key={opt}
              onMouseDown={() => { onChange(opt); setOpen(false); }}
              className={`cursor-pointer px-3 py-2 text-sm ${
                opt === value
                  ? "bg-violet-900/40 text-violet-300"
                  : opt === ""
                  ? "text-zinc-500"
                  : "text-zinc-100 hover:bg-zinc-700"
              }`}
            >
              {opt === "" ? placeholder : opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Props = { presetSpot?: string };

export default function ExperienceForm({ presetSpot = "" }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    title: "",
    display_name: "",
    prefecture: "",
    place_name: "",
    genre: "",
    scare_level: "3",
    body: "",
    related_spot_slug: presetSpot,
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) { setError("利用規約に同意してください。"); return; }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/experiences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, scare_level: Number(form.scare_level), guest_key: getUserKey() }),
    });

    const data = await res.json();
    if (data.ok) {
      router.push("/experiences/new?submitted=1");
    } else {
      setError(data.error ?? "投稿に失敗しました。");
      setSubmitting(false);
    }
  }

  const [isSubmitted, setIsSubmitted] = useState(false);
  useEffect(() => {
    setIsSubmitted(new URLSearchParams(window.location.search).get("submitted") === "1");
  }, []);

  // 投稿完了画面
  if (isSubmitted) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-8 text-center">
        <p className="text-lg font-semibold text-zinc-100">投稿ありがとうございます。</p>
        <p className="mt-2 text-sm text-zinc-400">内容を確認後、問題がなければ公開されます。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-zinc-900 p-6">
      {/* タイトル */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-400">タイトル <span className="text-red-400">*</span></label>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
          minLength={8}
          maxLength={80}
          placeholder="例：旧吹上トンネルで見た白い女性"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
        />
      </div>

      {/* 投稿者名 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-400">投稿者名（省略で「名無しの体験者」）</label>
        <input
          value={form.display_name}
          onChange={(e) => set("display_name", e.target.value)}
          maxLength={24}
          placeholder="名無しの体験者"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
        />
      </div>

      {/* 都道府県 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-400">都道府県 <span className="text-red-400">*</span></label>
        <SelectDown
          value={form.prefecture}
          onChange={(v) => set("prefecture", v)}
          options={PREFECTURES}
        />
      </div>

      {/* 場所名 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-400">場所名（任意）</label>
        <input
          value={form.place_name}
          onChange={(e) => set("place_name", e.target.value)}
          placeholder="旧吹上トンネル、廃病院、など"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
        />
      </div>

      {/* ジャンル */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-400">体験ジャンル <span className="text-red-400">*</span></label>
        <select
          value={form.genre}
          onChange={(e) => set("genre", e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none"
        >
          <option value="">選択してください</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* 怖さレベル */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-400">怖さレベル <span className="text-red-400">*</span></label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className={`flex cursor-pointer items-center gap-1 rounded-full border px-2 py-1 text-xs transition-colors sm:px-3 sm:text-sm ${Number(form.scare_level) === n ? "border-amber-500 bg-amber-900/30 text-amber-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
              <input type="radio" name="scare_level" value={n} checked={Number(form.scare_level) === n} onChange={() => set("scare_level", String(n))} className="sr-only" />
              {"★".repeat(n)}
            </label>
          ))}
        </div>
      </div>

      {/* 本文 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-400">本文 <span className="text-red-400">*</span></label>
        <div className="mb-2 rounded-lg border border-zinc-700 bg-zinc-800/40 p-3 text-xs text-zinc-300">
          <p className="mb-1 font-semibold text-zinc-200">投稿のコツ</p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>いつ頃の体験か</li>
            <li>どこで起きたのか</li>
            <li>誰といたのか</li>
            <li>何が起きたのか</li>
            <li>その後どうなったのか</li>
          </ul>
          <p className="mt-2 text-red-400">実名、住所、電話番号、個人を特定できる情報は書かないでください。私有地への侵入をすすめる内容は禁止です。</p>
        </div>
        <textarea
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          required
          minLength={100}
          maxLength={8000}
          rows={10}
          placeholder="体験談を入力してください（100〜8000文字）"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-zinc-500">{form.body.length} / 8000</p>
      </div>

      {/* 利用規約 */}
      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-violet-600" />
        <span>利用規約に同意する（個人情報・誹謗中傷・違法行為に関する内容は投稿しません）</span>
      </label>

      {/* Honeypot */}
      <input name="website" type="text" className="hidden" tabIndex={-1} autoComplete="off" />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-violet-700 py-3 font-semibold text-white hover:bg-violet-600 disabled:opacity-50"
      >
        {submitting ? "投稿中..." : "投稿する"}
      </button>
    </form>
  );
}
