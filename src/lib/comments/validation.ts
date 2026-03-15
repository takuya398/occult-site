const NG_WORDS = [
  "殺す",
  "死ね",
  "氏ね",
  "ころす",
  "自殺しろ",
  "消えろ",
  "バカ",
  "きもい",
  "ゴミ",
  "クズ",
];

const URL_PATTERN = /https?:\/\/|www\./i;

// 連続する同じ文字（スパム的な投稿）: 同文字10文字以上
const SPAM_PATTERN = /(.)\1{9,}/;

export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateComment(
  body: string,
  authorName: string
): ValidationResult {
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    return { ok: false, message: "コメント本文を入力してください。" };
  }

  if (trimmedBody.length > 1000) {
    return {
      ok: false,
      message: "コメントは1000文字以内で入力してください。",
    };
  }

  if (authorName.length > 50) {
    return { ok: false, message: "名前は50文字以内で入力してください。" };
  }

  if (URL_PATTERN.test(trimmedBody) || URL_PATTERN.test(authorName)) {
    return { ok: false, message: "URLの投稿はできません。" };
  }

  if (SPAM_PATTERN.test(trimmedBody)) {
    return { ok: false, message: "不正な形式のコメントです。" };
  }

  const target = trimmedBody + authorName;
  const foundNg = NG_WORDS.find((w) => target.includes(w));
  if (foundNg) {
    return { ok: false, message: "不適切な表現が含まれています。" };
  }

  return { ok: true };
}
