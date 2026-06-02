// ひらがな・カタカナ → ローマ字変換テーブル（wanakana 相当の簡易実装）
const KANA_MAP: [string, string][] = [
  ["きゃ","kya"],["きゅ","kyu"],["きょ","kyo"],
  ["しゃ","sha"],["しゅ","shu"],["しょ","sho"],
  ["ちゃ","cha"],["ちゅ","chu"],["ちょ","cho"],
  ["にゃ","nya"],["にゅ","nyu"],["にょ","nyo"],
  ["ひゃ","hya"],["ひゅ","hyu"],["ひょ","hyo"],
  ["みゃ","mya"],["みゅ","myu"],["みょ","myo"],
  ["りゃ","rya"],["りゅ","ryu"],["りょ","ryo"],
  ["ぎゃ","gya"],["ぎゅ","gyu"],["ぎょ","gyo"],
  ["じゃ","ja"], ["じゅ","ju"], ["じょ","jo"],
  ["びゃ","bya"],["びゅ","byu"],["びょ","byo"],
  ["ぴゃ","pya"],["ぴゅ","pyu"],["ぴょ","pyo"],
  ["あ","a"],["い","i"],["う","u"],["え","e"],["お","o"],
  ["か","ka"],["き","ki"],["く","ku"],["け","ke"],["こ","ko"],
  ["さ","sa"],["し","shi"],["す","su"],["せ","se"],["そ","so"],
  ["た","ta"],["ち","chi"],["つ","tsu"],["て","te"],["と","to"],
  ["な","na"],["に","ni"],["ぬ","nu"],["ね","ne"],["の","no"],
  ["は","ha"],["ひ","hi"],["ふ","fu"],["へ","he"],["ほ","ho"],
  ["ま","ma"],["み","mi"],["む","mu"],["め","me"],["も","mo"],
  ["や","ya"],["ゆ","yu"],["よ","yo"],
  ["ら","ra"],["り","ri"],["る","ru"],["れ","re"],["ろ","ro"],
  ["わ","wa"],["を","wo"],["ん","n"],
  ["が","ga"],["ぎ","gi"],["ぐ","gu"],["げ","ge"],["ご","go"],
  ["ざ","za"],["じ","ji"],["ず","zu"],["ぜ","ze"],["ぞ","zo"],
  ["だ","da"],["ぢ","di"],["づ","du"],["で","de"],["ど","do"],
  ["ば","ba"],["び","bi"],["ぶ","bu"],["べ","be"],["ぼ","bo"],
  ["ぱ","pa"],["ぴ","pi"],["ぷ","pu"],["ぺ","pe"],["ぽ","po"],
  ["っ",""],["ー","-"],
];

function kanaToRomaji(text: string): string {
  // カタカナ → ひらがな
  const hira = text.replace(/[ァ-ヶ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  );
  let result = "";
  let i = 0;
  while (i < hira.length) {
    let matched = false;
    for (const [kana, romaji] of KANA_MAP) {
      if (hira.startsWith(kana, i)) {
        result += romaji;
        i += kana.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += hira[i];
      i++;
    }
  }
  return result;
}

function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/[\s_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function generateExperienceSlug(
  title: string,
  placeName: string | null | undefined,
  storyNo: number
): string {
  const fallback = `experience-${String(storyNo).padStart(6, "0")}`;
  const base = [placeName, title].filter(Boolean).join(" ");
  if (!base) return fallback;

  const slug = normalizeSlug(kanaToRomaji(base));
  return slug.length < 3 ? fallback : slug;
}

export function formatStoryNo(storyNo: number): string {
  return String(storyNo).padStart(6, "0");
}

export function buildExperienceUrl(storyNo: number, slug: string): string {
  return `/experiences/${formatStoryNo(storyNo)}-${slug}`;
}

export function parseStoryNoFromParam(param: string): number | null {
  const match = param.match(/^(\d+)/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return isNaN(n) ? null : n;
}
