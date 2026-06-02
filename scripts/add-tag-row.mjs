import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const articlesDir = join(process.cwd(), "articles");

const slugs = readdirSync(articlesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let updated = 0;

for (const slug of slugs) {
  const filePath = join(articlesDir, slug, "index.md");
  let content;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    continue;
  }

  // すでにタグ行がある場合はスキップ
  if (content.includes("| タグ |")) continue;

  // frontmatterからtagsを取得
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) continue;

  const tagsMatch = fmMatch[1].match(/^tags:\s*\[([^\]]*)\]/m);
  if (!tagsMatch) continue;

  const tags = tagsMatch[1]
    .split(",")
    .map((t) => t.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean)
    .map((t) => `#${t}`)
    .join(" ");

  let newContent = content;

  // テーブル形式：| 信憑性 | の後にタグ行を挿入
  if (/^\| 信憑性 \|/m.test(content)) {
    newContent = content.replace(
      /(^\| 信憑性 \|.*$)/m,
      `$1\n| タグ | ${tags} |`
    );
  }
  // リスト形式：- 信憑性：の後にタグ行を挿入
  else if (/^- 信憑性[：:]/m.test(content)) {
    newContent = content.replace(
      /(^- 信憑性[：:].*$)/m,
      `$1\n- タグ：${tags}`
    );
  }

  if (newContent !== content) {
    writeFileSync(filePath, newContent, "utf-8");
    console.log(`Updated: ${slug}`);
    updated++;
  }
}

console.log(`\n合計 ${updated} 件更新しました`);
