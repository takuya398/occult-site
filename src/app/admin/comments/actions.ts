"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase-admin";

export async function approveComment(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("comments")
    .update({ is_approved: true })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/comments");
}

export async function deleteComment(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("comments").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/comments");
}
