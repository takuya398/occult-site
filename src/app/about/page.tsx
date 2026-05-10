import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "サイトについて",
  description: "オカルト図鑑は、心霊スポット・怪談・都市伝説・UMAを体系的にまとめた日本最大級のオカルト情報サイトです。",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← トップへ
          </Link>
        </div>

        <header className="mb-10 flex items-center gap-4">
          <Image src="/logo.png" alt="オカルト図鑑" width={48} height={48} className="rounded-full" />
          <h1 className="text-3xl font-semibold tracking-tight">サイトについて</h1>
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">オカルト図鑑とは</h2>
            <p className="mb-3">
              オカルト図鑑（Occult Encyclopedia）は、心霊スポット・怪談・都市伝説・UMA・怪事件など、
              オカルト・未解明現象に関する情報を体系的にまとめた情報サイトです。
            </p>
            <p>
              各記事では、目撃証言・写真・映像・DNA調査などの証拠を「実在度」「証拠強度」「危険度」として
              独自にスコアリングし、読者が客観的に情報を評価できるよう工夫しています。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">収録カテゴリ</h2>
            <ul className="space-y-2">
              {[
                { label: "心霊スポット", desc: "日本全国の心霊スポット・廃墟・怪奇現象が報告される場所を収録" },
                { label: "怪談・都市伝説", desc: "口承で語り継がれてきた怪談から現代の都市伝説まで幅広く掲載" },
                { label: "UMA・異形", desc: "世界各地で目撃報告がある未確認生物（UMA）を実在度とともに解説" },
                { label: "怪事件・ミステリー", desc: "未解決事件・不可解な失踪・謎の文書など歴史的ミステリーを収録" },
              ].map(({ label, desc }) => (
                <li key={label} className="flex gap-3">
                  <span className="shrink-0 font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">— {desc}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">免責事項</h2>
            <p>
              当サイトに掲載されている情報は、噂・伝承・目撃証言・研究報告などを含みます。
              情報の正確性・真実性を保証するものではありません。
              心霊スポットや危険区域への訪問は、法律・マナーを遵守し自己責任で行ってください。
              当サイトは探索行為を推奨しません。
            </p>
          </section>

          <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              ご意見・ご要望は
              <Link
                href="/contact"
                className="mx-1 underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                お問い合わせページ
              </Link>
              よりお気軽にどうぞ。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
