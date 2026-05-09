/**
 * 全スポット記事の frontmatter に mapQuery を一括追加するスクリプト。
 * 既に mapQuery が存在する記事はスキップする。
 *
 * 使い方: node scripts/add-mapquery.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const articlesDir = join(__dirname, "../articles");

/** frontmatter の値を1行テキストから取り出す */
function getFrontmatterValue(lines, key) {
  for (const line of lines) {
    const match = line.match(new RegExp(`^${key}:\\s*(.+)$`));
    if (match) {
      return match[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return "";
}

/** SEO タイトルから短いスポット名を抽出する
 * 例: "【心霊】青木ヶ原樹海｜自殺の名所の真実" → "青木ヶ原樹海"
 */
function extractSpotName(title) {
  // 1. 【...】 形式の接頭辞を除去
  let name = title.replace(/^【[^】]*】\s*/, "");
  // 2. ｜ 以降を除去
  const barIdx = name.indexOf("｜");
  if (barIdx !== -1) name = name.slice(0, barIdx).trim();
  // 3. | (半角) 以降を除去
  const barHalfIdx = name.indexOf("|");
  if (barHalfIdx !== -1) name = name.slice(0, barHalfIdx).trim();
  return name.trim();
}

/** frontmatter ブロックの終端インデックス（"---" 行）を返す */
function findFrontmatterEnd(lines) {
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      count++;
      if (count === 2) return i;
    }
  }
  return -1;
}

const slugs = readdirSync(articlesDir).filter((name) => {
  const full = join(articlesDir, name);
  return statSync(full).isDirectory();
});

let added = 0;
let skipped = 0;

for (const slug of slugs) {
  const indexPath = join(articlesDir, slug, "index.md");
  let raw;
  try {
    raw = readFileSync(indexPath, "utf8");
  } catch {
    continue; // index.md が存在しない場合はスキップ
  }

  // 既に mapQuery がある場合はスキップ
  if (raw.includes("mapQuery:")) {
    skipped++;
    continue;
  }

  const lines = raw.split(/\r?\n/);
  const endIdx = findFrontmatterEnd(lines);
  if (endIdx === -1) {
    console.warn(`[skip] ${slug}: frontmatter が見つかりません`);
    continue;
  }

  const title = getFrontmatterValue(lines, "title");
  const pref =
    getFrontmatterValue(lines, "prefecture") ||
    getFrontmatterValue(lines, "pref");

  const spotName = extractSpotName(title) || slug;
  const mapQuery = pref ? `${spotName} ${pref}` : spotName;

  // 閉じ "---" の直前に mapQuery 行を挿入
  lines.splice(endIdx, 0, `mapQuery: "${mapQuery}"`);

  writeFileSync(indexPath, lines.join("\n"), "utf8");
  console.log(`[add] ${slug}: mapQuery = "${mapQuery}"`);
  added++;
}

console.log(`\n完了: ${added} 件追加、${skipped} 件スキップ`);
