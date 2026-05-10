import Link from "next/link";
import Image from "next/image";

const mainLinks = [
  { label: "ホーム", href: "/" },
  { label: "プライバシーポリシー", href: "/privacy-policy" },
  { label: "お問い合わせ", href: "/contact" },
  { label: "サイトについて", href: "/about" },
];

const genreLinks = [
  { label: "心霊スポット", href: "/spots" },
  { label: "UMA・異形", href: "/entities" },
  { label: "都市伝説", href: "/legends" },
  { label: "怪談", href: "/legends" },
  { label: "禁足地", href: "/restricted-areas" },
];

export default function Footer() {
  return (
    <footer
      className="mt-16 w-full overflow-hidden"
      style={{
        background: "#0b0f19",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "48px 24px 24px",
      }}
    >
      <div className="mx-auto w-full max-w-5xl">
        {/* 3カラム */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* 1. サイト情報 */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="オカルト図鑑"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-base font-semibold text-[#f9fafb]">
                オカルト図鑑
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#9ca3af]">
              心霊スポット、UMA、都市伝説、怪談、禁足地などを記録するオカルト専門メディア。
            </p>
          </div>

          {/* 2. 主要リンク */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
              メニュー
            </p>
            <ul className="space-y-2.5">
              {mainLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group inline-flex items-center text-sm text-[#d1d5db] transition-colors duration-200 hover:text-white"
                  >
                    <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. ジャンル */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
              ジャンル
            </p>
            <ul className="space-y-2.5">
              {genreLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group inline-flex items-center text-sm text-[#d1d5db] transition-colors duration-200 hover:text-white"
                  >
                    <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div
          className="mt-10 flex flex-col gap-2 pt-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs text-[#6b7280]">
            © 2026 オカルト図鑑. All rights reserved.
          </p>
          <p className="text-xs leading-relaxed text-[#4b5563]">
            掲載内容には噂・伝承・体験談が含まれます。危険区域・私有地への無断立入はお控えください。
          </p>
        </div>
      </div>
    </footer>
  );
}
