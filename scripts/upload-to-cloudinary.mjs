/**
 * Cloudinary一括アップロードスクリプト
 * 使い方: node scripts/upload-to-cloudinary.mjs
 *
 * .env.local に以下を設定してください:
 *   CLOUDINARY_CLOUD_NAME=dgl4jmgvo
 *   CLOUDINARY_API_KEY=your_api_key
 *   CLOUDINARY_API_SECRET=your_api_secret
 */

import { v2 as cloudinary } from "cloudinary";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// .env.local を手動で読み込む
async function loadEnv() {
  try {
    const envPath = path.join(ROOT, ".env.local");
    const content = await fs.readFile(envPath, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
    }
  } catch {
    // .env.local がなくても環境変数が直接設定されていれば OK
  }
}

await loadEnv();

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error("❌ .env.local に以下を設定してください:");
  console.error("   CLOUDINARY_CLOUD_NAME=dgl4jmgvo");
  console.error("   CLOUDINARY_API_KEY=your_api_key");
  console.error("   CLOUDINARY_API_SECRET=your_api_secret");
  process.exit(1);
}

cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET });

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

// アップロード対象フォルダ (public/ 配下の相対パス)
const TARGET_DIRS = ["spots", "uma", "legends"];

async function collectImages(dir) {
  const results = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectImages(fullPath)));
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

async function uploadImage(filePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      overwrite: false,       // 既存はスキップ
      invalidate: false,
      use_filename: false,
    });
    return { ok: true, url: result.secure_url, publicId };
  } catch (err) {
    // already exists → skip
    if (err?.http_code === 400 && err?.message?.includes("already exists")) {
      return { ok: true, skipped: true, publicId };
    }
    return { ok: false, error: err?.message ?? String(err), publicId };
  }
}

const publicDir = path.join(ROOT, "public");

let total = 0;
let uploaded = 0;
let skipped = 0;
let failed = 0;
const failedList = [];

for (const targetDir of TARGET_DIRS) {
  const absDir = path.join(publicDir, targetDir);
  const images = await collectImages(absDir);

  console.log(`\n📁 ${targetDir}/ — ${images.length} 枚`);

  for (const imgPath of images) {
    total++;
    // public_id = "spots/aokigahara/cover" (拡張子なし)
    const rel = path.relative(publicDir, imgPath).replace(/\\/g, "/");
    const publicId = rel.replace(/\.[^.]+$/, ""); // 拡張子を除去

    process.stdout.write(`  [${total}] ${rel} ... `);
    const result = await uploadImage(imgPath, publicId);

    if (result.skipped) {
      process.stdout.write("スキップ（既存）\n");
      skipped++;
    } else if (result.ok) {
      process.stdout.write("✅ アップロード完了\n");
      uploaded++;
    } else {
      process.stdout.write(`❌ 失敗: ${result.error}\n`);
      failed++;
      failedList.push({ path: rel, error: result.error });
    }
  }
}

console.log("\n=============================");
console.log(`✅ アップロード: ${uploaded} 枚`);
console.log(`⏭  スキップ:     ${skipped} 枚`);
console.log(`❌ 失敗:         ${failed} 枚`);
console.log(`合計:             ${total} 枚`);

if (failedList.length > 0) {
  console.log("\n--- 失敗ファイル一覧 ---");
  for (const f of failedList) {
    console.log(`  ${f.path}: ${f.error}`);
  }
}
