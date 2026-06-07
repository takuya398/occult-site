// X (Twitter) character counting and tweet generation utilities.
// Characters above U+10FF (CJK, hiragana, katakana, etc.) count as 2 weighted chars.
// URLs always count as 23 weighted chars regardless of actual length.

export function twitterCharCount(text: string): number {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) ?? [];
  let count = urls.length * 23;
  const withoutUrls = text.replace(urlRegex, "");
  for (const char of withoutUrls) {
    count += (char.codePointAt(0) ?? 0) > 0x10ff ? 2 : 1;
  }
  return count;
}

function charWeight(char: string): number {
  return (char.codePointAt(0) ?? 0) > 0x10ff ? 2 : 1;
}

function truncateToWeight(str: string, maxWeight: number): string {
  let count = 0;
  let result = "";
  for (const char of str) {
    const w = charWeight(char);
    if (count + w + 2 > maxWeight) break; // reserve 2 for "…"
    result += char;
    count += w;
  }
  return result.length < str.length ? result.trimEnd() + "…" : result;
}

export function generateSpotTweet(article: {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
}): string {
  const url = `https://occultpedia.jp/spots/${article.slug}`;
  const hashtags = article.tags.slice(0, 5).map((t) => `#${t}`).join(" ");
  const footer = `\n\n${url}` + (hashtags ? `\n\n${hashtags}` : "");
  const footerWeight = twitterCharCount(footer);

  // Extract the hook from the title (text after ｜ or ── separator)
  let hook = article.title;
  for (const sep of ["｜", "──"]) {
    const idx = article.title.indexOf(sep);
    if (idx !== -1 && article.title.length > idx + sep.length) {
      hook = article.title.slice(idx + sep.length).trim();
      break;
    }
  }

  // Budget: 280 - footer - separator between hook and summary
  const bodyBudget = 280 - footerWeight - 2;
  const hookBudget = Math.min(Math.floor(bodyBudget * 0.45), 100);
  const truncatedHook = truncateToWeight(hook, hookBudget);
  const hookWeight = twitterCharCount(truncatedHook);
  const summaryBudget = bodyBudget - hookWeight - 2;
  const truncatedSummary = truncateToWeight(article.summary, Math.max(summaryBudget, 0));

  return `${truncatedHook}\n\n${truncatedSummary}${footer}`;
}
