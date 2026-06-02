/**
 * 記事のMarkdownファイルに空行を挿入して読みやすくするスクリプト
 * 連続するテキスト行の間に空行を追加する
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";

const articleDirs = readdirSync("articles", { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => `articles/${d.name}/index.md`);
const files = articleDirs.filter((f) => {
  try { readFileSync(f); return true; } catch { return false; }
});

let updatedCount = 0;

for (const file of files) {
  const original = readFileSync(file, "utf8");
  const lines = original.split("\n");
  const result = [];

  let inFrontmatter = false;
  let frontmatterCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // フロントマター処理
    if (line.trim() === "---" && frontmatterCount < 2) {
      frontmatterCount++;
      if (frontmatterCount === 1) inFrontmatter = true;
      if (frontmatterCount === 2) inFrontmatter = false;
      result.push(line);
      continue;
    }
    if (inFrontmatter) {
      result.push(line);
      continue;
    }

    // 空行を挿入する必要があるか判定
    const prevLine = result[result.length - 1];

    if (prevLine !== undefined && shouldInsertBlank(prevLine, line)) {
      result.push("");
    }

    result.push(line);
  }

  const newContent = result.join("\n");
  if (newContent !== original) {
    writeFileSync(file, newContent);
    console.log(`Updated: ${file}`);
    updatedCount++;
  }
}

console.log(`\n完了: ${updatedCount} ファイルを更新しました`);

/**
 * 2行の間に空行を挿入すべきかどうか判定
 */
function shouldInsertBlank(prev, curr) {
  // どちらかが空行なら不要
  if (prev.trim() === "" || curr.trim() === "") return false;

  // 現在行がテキスト行でなければ不要
  if (!isTextLine(curr)) return false;

  // 前の行がテキスト行でなければ不要
  if (!isTextLine(prev)) return false;

  // 両行とも・で始まる場合は連続リストとみなしてスキップ
  if (prev.trim().startsWith("・") && curr.trim().startsWith("・")) return false;

  return true;
}

/**
 * 通常のテキスト行かどうか（見出し・画像・区切り・リスト等を除く）
 */
function isTextLine(line) {
  const t = line.trim();
  if (t === "") return false;
  if (t.startsWith("#")) return false;       // 見出し
  if (t.startsWith("![")) return false;      // 画像
  if (t === "---") return false;             // 水平線
  if (t.startsWith("|")) return false;       // テーブル
  if (t.startsWith(">")) return false;       // 引用
  if (t.startsWith("```")) return false;     // コードブロック
  if (t.startsWith("{{")) return false;      // テンプレート
  if (/^[-*] /.test(t)) return false;       // Markdownリスト（- や * ）
  if (/^\d+\. /.test(t)) return false;      // 番号付きリスト
  return true;
}
