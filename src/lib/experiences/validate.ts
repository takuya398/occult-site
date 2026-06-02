const HTML_PATTERN = /<[^>]*>/;
const URL_PATTERN = /https?:\/\/|www\./gi;
const TEL_PATTERN = /(\d[\d\-ー－]{8,}\d)/;
const EMAIL_PATTERN = /[\w.+\-]+@[\w\-]+\.[a-z]{2,}/i;
const ADDRESS_PATTERN = /\d{3}[-−]\d{4}|[都道府県市区町村]\d+/;
const KILL_WORDS = ["殺す", "ころす", "殺害する", "爆破する", "消えろ", "死ね", "氏ね"];
const SEX_WORDS = ["エロ", "えろ", "ポルノ", "セックス"];
const SPAM_DOMAINS = ["bit.ly", "tinyurl", "goo.gl", "short.link"];

function countUrls(text: string): number {
  const matches = text.match(URL_PATTERN);
  return matches ? matches.length : 0;
}

function hasNgContent(text: string): boolean {
  return (
    TEL_PATTERN.test(text) ||
    EMAIL_PATTERN.test(text) ||
    ADDRESS_PATTERN.test(text) ||
    KILL_WORDS.some((w) => text.includes(w)) ||
    SEX_WORDS.some((w) => text.includes(w)) ||
    SPAM_DOMAINS.some((d) => text.includes(d))
  );
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

export type ValidationResult =
  | { ok: true; status: "published" | "pending" }
  | { ok: false; message: string };

export function validateExperienceTitle(title: string): ValidationResult {
  const t = stripHtml(title.trim());
  if (!t) return { ok: false, message: "タイトルを入力してください。" };
  if (HTML_PATTERN.test(title)) return { ok: false, message: "HTMLタグは使用できません。" };
  if (t.length < 8) return { ok: false, message: "タイトルは8文字以上で入力してください。" };
  if (t.length > 80) return { ok: false, message: "タイトルは80文字以内で入力してください。" };
  return { ok: true, status: "pending" };
}

export function validateExperienceBody(body: string): ValidationResult {
  const t = stripHtml(body.trim());
  if (!t) return { ok: false, message: "本文を入力してください。" };
  if (HTML_PATTERN.test(body)) return { ok: false, message: "HTMLタグは使用できません。" };
  if (t.length < 100) return { ok: false, message: "本文は100文字以上で入力してください。" };
  if (t.length > 8000) return { ok: false, message: "本文は8000文字以内で入力してください。" };

  const urlCount = countUrls(t);
  if (urlCount >= 5) return { ok: false, message: "URLが多すぎます。本文内のURLを減らしてください。" };
  if (hasNgContent(t)) return { ok: true, status: "pending" };
  if (urlCount >= 3) return { ok: true, status: "pending" };

  return { ok: true, status: "published" };
}

export function validateCommentBody(body: string): ValidationResult {
  const t = stripHtml(body.trim());
  if (!t) return { ok: false, message: "コメントを入力してください。" };
  if (HTML_PATTERN.test(body)) return { ok: false, message: "HTMLタグは使用できません。" };
  if (t.length < 10) return { ok: false, message: "コメントは10文字以上で入力してください。" };
  if (t.length > 1000) return { ok: false, message: "コメントは1000文字以内で入力してください。" };
  if (hasNgContent(t)) return { ok: true, status: "pending" };
  if (countUrls(t) >= 1) return { ok: true, status: "pending" };
  return { ok: true, status: "published" };
}

export function validateDisplayName(name: string): ValidationResult {
  if (name.length > 24) return { ok: false, message: "名前は24文字以内で入力してください。" };
  if (HTML_PATTERN.test(name)) return { ok: false, message: "HTMLタグは使用できません。" };
  return { ok: true, status: "published" };
}
