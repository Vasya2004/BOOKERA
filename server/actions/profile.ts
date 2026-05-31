"use server";

import { revalidatePath } from "next/cache";
import { profileFormSchema } from "@/lib/validators/book";
import { requireUser } from "@/server/actions/auth-helpers";
import { failure, success, type ActionResult } from "@/server/actions/result";

export async function updateProfile(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = profileFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return failure("Проверьте поля профиля.");
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName || null,
      avatar_url: parsed.data.avatarUrl || null,
    })
    .eq("id", user.id);

  if (error) {
    return failure(error.message);
  }

  revalidatePath("/settings");
  return success("Профиль обновлён");
}
