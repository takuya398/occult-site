import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "uma");

const TARGET_EXTS = new Set([".png", ".webp", ".jpeg"]);
const JPG_QUALITY = 85;

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function main() {
  if (!fs.existsSync(ROOT)) {
    console.log("public/uma が存在しません:", ROOT);
    process.exit(1);
  }

  const files = [];
  for (const f of walk(ROOT)) files.push(f);

  const candidates = files.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    const base = path.basename(f).toLowerCase();
    return (
      TARGET_EXTS.has(ext) &&
      (base.startsWith("cover") || base.startsWith("scene"))
    );
  });

  if (candidates.length === 0) {
    console.log("変換対象が見つかりませんでした。");
    return;
  }

  for (const src of candidates) {
    const ext = path.extname(src);
    const dir = path.dirname(src);
    const base = path.basename(src, ext);
    const dst = path.join(dir, `${base}.jpg`);

    if (fs.existsSync(dst)) {
      console.log("SKIP (exists):", dst);
      continue;
    }

    await sharp(src)
      .jpeg({ quality: JPG_QUALITY, mozjpeg: true })
      .toFile(dst);

    console.log(
      "OK:",
      path.relative(process.cwd(), src),
      "->",
      path.relative(process.cwd(), dst),
    );
  }

  console.log(
    "完了。uma.json が .png を参照している場合は、jpg に揃える必要があります。",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});