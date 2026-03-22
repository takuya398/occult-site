/**
 * sources.md を [タイトル](URL) 形式に正規化するスクリプト
 * 使い方: node scripts/normalize-sources.mjs
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "articles");

// ドメイン → サイト名マッピング
const DOMAIN_LABELS = {
  "ghostmap.jp": "全国心霊マップ",
  "takewo.xsrv.jp": "心霊スポット動画まとめ",
  "sinreikousatu.jp": "心霊考察",
  "haikyo.info": "廃墟検索地図",
  "kaii-shiryoukan.com": "怪異資料館",
  "kaiki-siryokan.com": "怪異資料館",
  "urbanlegend.jp": "都市伝説Japan",
  "ruins-cat.com": "廃墟と猫",
  "ameblo.jp": "アメーバブログ",
  "ja.wikipedia.org": "Wikipedia",
  "commons.wikimedia.org": "Wikimedia Commons",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "www.youtube.com": "YouTube",
  "occultravel.com": "オカルトラベル",
  "yugenchi.com": "幽現地",
  "haunted-japan.com": "恐怖心霊の闇底",
  "shinrei-spot.info": "日本の心霊スポット大全集",
  "shinrei-spot.com": "心霊スポット大全",
  "poltergeist.jp": "心霊体験まとめ",
  "sugomen-chi.com": "すごめんち",
  "www.gibo-kantei.com": "霊視検証",
  "blog.goo.ne.jp": "Gooブログ",
  "detail.chiebukuro.yahoo.co.jp": "Yahoo!知恵袋",
  "tabi-and-everyday.com": "旅と日常",
  "note.com": "note",
  "occult666love.wixsite.com": "個人サイト",
  "thetuburo.com": "個人ブログ",
  "yuruneto.com": "ゆるねとにゅーす",
  "urbanlife.tokyo": "アーバンライフ東京",
  "kakuyomu.jp": "カクヨム",
  "kaidan.guidebook.jp": "怪談ガイドブック",
  "ruins-cat.com": "廃墟と猫",
  "www.departure-ruins.com": "廃墟探索サイト",
  "4travel.jp": "4travel",
  "ag71-official.com": "個人ブログ",
  "mintoku.ne.jp": "みんなの趣味",
  "thegate12.com": "THE GATE",
  "blog.tinect.jp": "Books&Apps",
  "camerastudy.net": "カメラスタディラボ",
  "hirotravel.com": "hirotravel",
  "haradaoffice.biz": "個人ブログ",
  "www.tokai-tv.com": "東海テレビ",
  "trilltrill.jp": "Trill",
  "news.livedoor.com": "livedoorニュース",
  "x.com": "X（Twitter）",
  "twitter.com": "X（Twitter）",
  "www.kaikowa.com": "怪怖",
  "web-mu.jp": "MU",
  "yorozoonews.jp": "よろず~ニュース",
  "press.moviewalker.jp": "MovieWalker",
  "www.banger.jp": "Banger",
  "news.yahoo.co.jp": "Yahoo!ニュース",
  "www.vill.ogasawara.tokyo.jp": "小笠原村公式",
  "www.city.miyawaka.lg.jp": "宮若市公式",
  "techmuddy.com": "Techmuddy",
  "shinbeblog.com": "shinbeblog",
  "hibiyajinja.com": "個人ブログ",
  "takato.stars.ne.jp": "個人サイト",
  "occultravel.com": "オカルトラベル",
  "chayarokurokuro.blog.jp": "chayarokurokuroの雑記ブログ",
  "soramaga.com": "そらまが",
  "www.asasikibu.com": "朝日紙分",
  "恐怖の泉.com": "恐怖の泉",
  "aomori-tourism.com": "Amazing AOMORI",
  "mutsu-kanko.jp": "むつ市観光協会",
  "kowaihanasi.ghostmap.jp": "洒落にならない怖い話",
};

function getDomainLabel(url) {
  try {
    const { hostname } = new URL(url);
    const bare = hostname.replace(/^www\./, "");
    // フルホスト名で検索
    if (DOMAIN_LABELS[hostname]) return DOMAIN_LABELS[hostname];
    // www.なしで検索
    if (DOMAIN_LABELS[bare]) return DOMAIN_LABELS[bare];
    // 部分一致
    for (const [domain, label] of Object.entries(DOMAIN_LABELS)) {
      if (hostname.includes(domain) || bare.includes(domain)) return label;
    }
    return hostname;
  } catch {
    return url;
  }
}

// 行からURLと前後のテキストを抽出
function extractUrlsFromLine(line) {
  const urlRegex = /https?:\/\/[^\s)）\]>]+/g;
  const urls = [...line.matchAll(urlRegex)].map((m) => m[0]);
  return urls;
}

// 既存の [title](url) 形式かチェック
function isAlreadyFormatted(line) {
  return /^\s*-\s*\[.+\]\(https?:\/\/.+\)/.test(line);
}

// ラインからタイトルヒントを抽出（URL以外の日本語テキスト）
function extractTitleHint(line) {
  // Markdown見出し行・画像クレジット・空行はスキップ
  const clean = line
    .replace(/https?:\/\/[^\s)）\]>]+/g, "")
    .replace(/^[-*#]+\s*/, "")
    .replace(/^\d+\.\s*/, "")
    .replace(/\[|\]/g, "")
    .replace(/[（）()]/g, "")
    .replace(/：.*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // 意味のあるテキストが残っていれば使う（5文字以上）
  if (clean.length >= 5 && !/^https?/.test(clean)) {
    return clean;
  }
  return null;
}

async function normalizeSourcesFile(slug) {
  const srcPath = path.join(ARTICLES_DIR, slug, "sources.md");
  let raw;
  try {
    raw = await fs.readFile(srcPath, "utf-8");
  } catch {
    return null; // sources.md なし
  }

  const lines = raw.split(/\r?\n/);
  const outputLines = [];
  let changed = false;

  for (const line of lines) {
    // すでに [title](url) 形式ならそのまま
    if (isAlreadyFormatted(line)) {
      outputLines.push(line);
      continue;
    }

    // URLが含まれる行を変換
    const urls = extractUrlsFromLine(line);
    if (urls.length === 0) {
      // URLなし：見出し行・注記・画像クレジット行は除去対象かチェック
      const trimmed = line.trim();
      // 空行・## 見出し・# 見出し・「画像」「動画」「補足」などの補助情報行はスキップ
      const isHeaderOrNote =
        /^#{1,3}\s/.test(trimmed) ||
        /^---/.test(trimmed) ||
        /^(画像|動画|補足|クレジット|メモ|注意|Image|File page|Author|License|Credit|Source|TODO|※)/i.test(trimmed) ||
        /\.(jpg|jpeg|png|webp|gif)/.test(trimmed) ||
        trimmed === "";

      if (!isHeaderOrNote) {
        // 純テキスト出典（URLなし）はそのまま保持
        outputLines.push(line);
      } else {
        changed = true; // 行を削除したので変更あり
      }
      continue;
    }

    // URL行 → [title](url) に変換
    for (const url of urls) {
      const hint = extractTitleHint(line);
      const domainLabel = getDomainLabel(url);
      const title = hint && hint !== domainLabel ? `${domainLabel}「${hint}」` : domainLabel;
      outputLines.push(`- [${title}](${url})`);
      changed = true;
    }
  }

  // 重複行を除去
  const seen = new Set();
  const deduped = outputLines.filter((l) => {
    if (seen.has(l)) return false;
    seen.add(l);
    return true;
  });

  return { slug, content: deduped.join("\n") + "\n", changed };
}

const dirs = await fs.readdir(ARTICLES_DIR);
let updated = 0;
let skipped = 0;

for (const dir of dirs) {
  const result = await normalizeSourcesFile(dir);
  if (!result) { skipped++; continue; }

  await fs.writeFile(
    path.join(ARTICLES_DIR, dir, "sources.md"),
    result.content,
    "utf-8"
  );
  console.log(`✅ ${dir}/sources.md`);
  updated++;
}

console.log(`\n完了: ${updated} 件更新 / ${skipped} 件スキップ`);
