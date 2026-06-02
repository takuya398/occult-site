import { type Metadata } from "next";
import ExperienceForm from "@/components/experiences/ExperienceForm";

export const metadata: Metadata = {
  title: "心霊体験談を投稿する",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ spot?: string }> };

export default async function NewExperiencePage({ searchParams }: Props) {
  const sp = await searchParams;
  const presetSpot = sp.spot ?? "";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="gothic-title mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          心霊体験談を投稿する
        </h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          内容を確認後、問題がなければ公開されます。
        </p>
        <ExperienceForm presetSpot={presetSpot} />
      </div>
    </div>
  );
}
