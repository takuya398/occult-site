const USER_KEY_STORAGE = "_uk";
const LIKED_STORAGE = "_liked";

/** localStorage からユーザーキーを取得（なければ生成して保存） */
export function getUserKey(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem(USER_KEY_STORAGE);
  if (stored) return stored;
  const key = crypto.randomUUID();
  localStorage.setItem(USER_KEY_STORAGE, key);
  return key;
}

/** 指定コメントにグッド済みかどうかを localStorage から確認 */
export function isCommentLiked(commentId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(LIKED_STORAGE);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    return ids.includes(commentId);
  } catch {
    return false;
  }
}

/** localStorage のグッド状態を更新 */
export function setCommentLiked(commentId: string, liked: boolean): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LIKED_STORAGE);
    let ids: string[] = raw ? JSON.parse(raw) : [];
    if (liked) {
      if (!ids.includes(commentId)) ids.push(commentId);
    } else {
      ids = ids.filter((id) => id !== commentId);
    }
    localStorage.setItem(LIKED_STORAGE, JSON.stringify(ids));
  } catch {
    // localStorage が使えない環境では無視
  }
}
