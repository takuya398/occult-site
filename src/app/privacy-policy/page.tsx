import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "オカルト図鑑のプライバシーポリシーです。個人情報の取り扱いについてご確認ください。",
};

export default function PrivacyPolicyPage() {
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

        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">プライバシーポリシー</h1>
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p>
            オカルト図鑑（以下、「当サイト」）では、利用者のプライバシーを尊重し、個人情報の保護に努めます。
            本プライバシーポリシーでは、当サイトにおける個人情報の取り扱いについて説明します。
          </p>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">1. 個人情報の利用目的</h2>
            <p className="mb-3">
              当サイトでは、お問い合わせやコメント投稿の際に、名前やメールアドレス等の個人情報を入力いただく場合があります。
              取得した個人情報は、以下の目的以外では利用しません。
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>お問い合わせへの回答</li>
              <li>必要な情報のご連絡</li>
              <li>不正利用・スパム対策</li>
              <li>サービス改善のための分析</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">2. 広告配信について</h2>
            <p className="mb-2">
              当サイトでは、第三者配信の広告サービス（Google AdSense等）を利用する場合があります。
            </p>
            <p className="mb-2">
              広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
            </p>
            <p>
              Cookieを使用することで当サイトはユーザーのコンピュータを識別できるようになりますが、個人を特定するものではありません。
              Cookieを無効にする方法やGoogle広告に関する詳細は、Googleの広告ポリシーをご確認ください。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">3. アクセス解析ツールについて</h2>
            <p className="mb-2">
              当サイトでは、Google Analytics等のアクセス解析ツールを利用する場合があります。
            </p>
            <p>
              アクセス解析ツールは、トラフィックデータ収集のためにCookieを使用しています。
              このデータは匿名で収集されており、個人を特定するものではありません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">4. コメントについて</h2>
            <p>
              当サイトでは、スパム・荒らし対策として、コメント投稿時にIPアドレスを記録する場合があります。
              これはブログ・Webサイトの標準機能としてサポートされている機能であり、スパム対策以外にこのIPアドレスを使用することはありません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">5. 外部サービスについて</h2>
            <p className="mb-3">当サイトでは、以下の外部サービスを利用する場合があります。</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Google Maps</li>
              <li>YouTube</li>
              <li>SNS埋め込み機能</li>
              <li>外部リンク</li>
            </ul>
            <p className="mt-3">
              外部サービスにおける個人情報の取り扱いについては、各サービス提供元のプライバシーポリシーをご確認ください。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">6. 免責事項</h2>
            <p className="mb-2">
              当サイトでは、心霊・UMA・都市伝説・怪談・伝承などに関する情報を掲載しています。
              掲載内容には、噂、体験談、伝承、インターネット上の情報などが含まれる場合があります。
            </p>
            <p>
              当サイトは情報の正確性・真実性を保証するものではありません。
              また、当サイトの情報を利用したことによって発生した損害・トラブル等について、一切の責任を負いかねます。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">7. 心霊スポット・危険地域について</h2>
            <p className="mb-2">
              当サイトで紹介する場所には、危険区域、立入禁止区域、私有地等が含まれる場合があります。
            </p>
            <p>
              訪問される場合は、法律・条例・マナーを遵守し、必ず自己責任で行動してください。
              当サイトは、肝試し・探索行為等を推奨するものではありません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">8. 著作権について</h2>
            <p>
              当サイトに掲載されている文章・画像等の著作物の無断転載を禁止します。
              引用を行う場合は、引用元を明記し、著作権法の範囲内で行ってください。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">9. プライバシーポリシーの変更</h2>
            <p>
              本ポリシーの内容は、必要に応じて変更される場合があります。
              最新のプライバシーポリシーは本ページにて公開します。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">10. お問い合わせ</h2>
            <p>
              当サイトに関するお問い合わせは、
              <Link href="/contact" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">
                お問い合わせページ
              </Link>
              よりお願いいたします。
            </p>
          </section>

          <div className="border-t border-zinc-200 pt-6 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            <p>制定日：2026年5月10日</p>
            <p>サイト名：オカルト図鑑</p>
            <p>URL：https://occultpedia.jp/</p>
          </div>
        </div>
      </div>
    </div>
  );
}
