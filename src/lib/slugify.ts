/**
 * 見出しテキストをHTMLのid属性に使えるslugに変換する。
 * ToCのリンクとMarkdown h2要素のidを同一のロジックで生成するために共有。
 * - 日本語・CJK文字はそのまま保持
 * - 先頭・末尾の空白を除去し、内部空白を "-" に変換
 * - Markdown記法（**, *, `）を除去
 */
export function slugify(text: string): string {
  return text
    .trim()
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\s+/g, "-");
}
