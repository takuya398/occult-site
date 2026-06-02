const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function formatBoardDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const w = WEEKDAYS[d.getDay()];
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd}(${w}) ${hh}:${min}:${ss}`;
}

export function formatStoryNo(n: number): string {
  return String(n).padStart(6, "0");
}

export function scareStars(level: number): string {
  return "★".repeat(level) + "☆".repeat(5 - level);
}
