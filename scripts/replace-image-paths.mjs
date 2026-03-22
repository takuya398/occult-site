/**
 * Cloudinary パス置換スクリプト
 * 使い方: node scripts/replace-image-paths.mjs
 *
 * 置換対象:
 *   1. articles/{slug}/index.md  — cover フロントマター + ![sceneN](/spots/...) 本文
 *   2. src/data/json/entities.json, uma.json, spots.json, stories.json — "src" フィールド
 *   3. src/lib/legends/imageMap.ts — ファイル名 → Cloudinary URL
 *
 * 注意: アップロード完了後に実行してください。
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const CLOUD_NAME = "dgl4jmgvo";
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto`;

/** /spots/foo/cover.jpg → Cloudinary URL */
function toCloudinaryUrl(localPath) {
  // 先頭の / を除去して public_id を作る（拡張子は保持してよいがCloudinaryは自動解決）
  const clean = localPath.replace(/^\//, "");
  return `${BASE_URL}/${clean}`;
}

let totalReplacements = 0;
const changedFiles = [];

// ─────────────────────────────────────────────
// 1. articles/*/index.md
// ─────────────────────────────────────────────
async function replaceArticles() {
  const articlesDir = path.join(ROOT, "articles");
  let dirs;
  try {
    dirs = await fs.readdir(articlesDir);
  } catch {
    console.log("⚠ articles/ ディレクトリが見つかりません");
    return;
  }

  let count = 0;
  for (const dir of dirs) {
    const mdPath = path.join(articlesDir, dir, "index.md");
    let content;
    try {
      content = await fs.readFile(mdPath, "utf-8");
    } catch {
      continue;
    }

    const original = content;

    // フロントマター: cover: "/spots/..." or cover: "/uma/..." など
    content = content.replace(
      /^(cover:\s*)"(\/(?:spots|uma|legends)\/[^"]+)"/gm,
      (_, prefix, localPath) => `${prefix}"${toCloudinaryUrl(localPath)}"`
    );

    // 本文の Markdown 画像: ![anything](/spots/...) etc.
    content = content.replace(
      /!\[([^\]]*)\]\(\/(spots|uma|legends)\/([^)]+)\)/g,
      (_, alt, folder, rest) => `![${alt}](${BASE_URL}/${folder}/${rest})`
    );

    if (content !== original) {
      await fs.writeFile(mdPath, content, "utf-8");
      const replaced = (original.match(/(cover:|!\[)/g) ?? []).length;
      count++;
      totalReplacements += replaced;
      changedFiles.push(`articles/${dir}/index.md`);
    }
  }
  console.log(`📝 articles/: ${count} ファイル変更`);
}

// ─────────────────────────────────────────────
// 2. src/data/json/*.json — "src" フィールド
// ─────────────────────────────────────────────
async function replaceJsonFiles() {
  const jsonFiles = [
    "src/data/json/entities.json",
    "src/data/json/uma.json",
    "src/data/json/spots.json",
    "src/data/json/stories.json",
  ];

  for (const rel of jsonFiles) {
    const filePath = path.join(ROOT, rel);
    let content;
    try {
      content = await fs.readFile(filePath, "utf-8");
    } catch {
      console.log(`⚠ ${rel} が見つかりません`);
      continue;
    }

    const original = content;

    // "src": "/uma/..." や "src": "/spots/..." などを置換
    content = content.replace(
      /"src":\s*"(\/(spots|uma|legends)\/[^"]+)"/g,
      (_, localPath) => `"src": "${toCloudinaryUrl(localPath)}"`
    );

    if (content !== original) {
      await fs.writeFile(filePath, content, "utf-8");
      const matches = (original.match(/"src":\s*"\/(?:spots|uma|legends)\//g) ?? []).length;
      totalReplacements += matches;
      changedFiles.push(rel);
      console.log(`  ✅ ${rel}: ${matches} 件置換`);
    } else {
      console.log(`  ⏭  ${rel}: 変更なし`);
    }
  }
}

// ─────────────────────────────────────────────
// 3. src/lib/legends/imageMap.ts
//    ファイル名 → Cloudinary URL に変換
// ─────────────────────────────────────────────
async function replaceLegendImageMap() {
  const filePath = path.join(ROOT, "src/lib/legends/imageMap.ts");
  let content;
  try {
    content = await fs.readFile(filePath, "utf-8");
  } catch {
    console.log("⚠ imageMap.ts が見つかりません");
    return;
  }

  const original = content;

  // コメントを更新
  content = content.replace(
    /\* 画像は public\/legends\/\{slug\}\/ に置く。\s*\n\s*\* パス: \/legends\/\{slug\}\/\{filename\}/,
    `* 画像は Cloudinary に保存。\n * URL: ${BASE_URL}/legends/{slug}/{filename}`
  );

  // Record 型を string → string に変更（既に string のはずだが確認）
  // 値のファイル名を Cloudinary URL に変換する方法:
  // スラグはプロパティキーから取得できないため、各エントリを個別に処理

  // パターン: "slug-name": { cover: "filename.ext", ... }
  // → 各スラグを抽出して URL を組み立てる
  content = content.replace(
    /^(\s*"([\w-]+)":\s*\{)([\s\S]*?)(\s*\},?)/gm,
    (match, open, slug, body, close) => {
      const newBody = body.replace(
        /(\s*(cover|scene\d+):\s*)"([^"]+\.(?:jpg|jpeg|png|webp|gif|avif)[^"]*)"/g,
        (_, prefix, key, filename) =>
          `${prefix}"${BASE_URL}/legends/${slug}/${filename}"`
      );
      return `${open}${newBody}${close}`;
    }
  );

  if (content !== original) {
    await fs.writeFile(filePath, content, "utf-8");
    const matches = (original.match(/scene\d+:|cover:/g) ?? []).length;
    totalReplacements += matches;
    changedFiles.push("src/lib/legends/imageMap.ts");
    console.log(`  ✅ imageMap.ts: ${matches} 件置換`);
  } else {
    console.log("  ⏭  imageMap.ts: 変更なし");
  }
}

// ─────────────────────────────────────────────
// 実行
// ─────────────────────────────────────────────
console.log("🔄 パス置換を開始します...\n");

await replaceArticles();

console.log("\n📋 JSON ファイル:");
await replaceJsonFiles();

console.log("\n🗺  legendImageMap:");
await replaceLegendImageMap();

console.log("\n=============================");
console.log(`変更ファイル: ${changedFiles.length} 件`);
console.log(`置換件数合計: ${totalReplacements} 件`);
console.log("\n変更ファイル一覧:");
for (const f of changedFiles) {
  console.log(`  - ${f}`);
}

console.log("\n✅ 完了！次のステップ:");
console.log("  1. npm run dev でサイトを確認");
console.log("  2. 問題なければ public/ 削除候補リストを確認");
