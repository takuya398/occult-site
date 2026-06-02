import { createHash } from "crypto";
import { supabase } from "@/lib/supabase";

const SALT = process.env.RATE_LIMIT_SALT ?? "default-salt";

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip + SALT).digest("hex");
}

export function hashUserAgent(ua: string): string {
  return createHash("sha256").update(ua + SALT).digest("hex");
}

type ActionType = "experience" | "comment" | "report";

const LIMITS: Record<ActionType, { count: number; minutes: number }> = {
  experience: { count: 3, minutes: 60 },
  comment: { count: 5, minutes: 10 },
  report: { count: 10, minutes: 60 },
};

export async function checkRateLimit(
  actionType: ActionType,
  ipHash: string
): Promise<boolean> {
  const { count, minutes } = LIMITS[actionType];
  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();

  const { count: existing } = await supabase
    .from("rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("action_type", actionType)
    .eq("ip_hash", ipHash)
    .gte("window_start", since);

  return (existing ?? 0) < count;
}

export async function recordRateLimit(
  actionType: ActionType,
  ipHash: string,
  userAgentHash?: string,
  guestKey?: string
): Promise<void> {
  await supabase.from("rate_limits").insert({
    action_type: actionType,
    ip_hash: ipHash,
    user_agent_hash: userAgentHash ?? null,
    guest_key: guestKey ?? null,
    window_start: new Date().toISOString(),
  });
}
