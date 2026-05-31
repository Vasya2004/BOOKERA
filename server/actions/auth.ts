"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { failure, type ActionResult } from "@/server/actions/result";

export async function signInWithPassword(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return failure("Введите email и пароль.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return failure(error.message);
  }

  redirect("/library");
}

export async function signUpWithPassword(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!email || password.length < 6) {
    return failure("Введите email и пароль минимум из 6 символов.");
  }

  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || null } },
  });

  if (error) {
    return failure(error.message);
  }

  if (session) {
    redirect("/library");
  }

  return {
    ok: true,
    message:
      "Аккаунт создан. Подтвердите email, если в Supabase включено подтверждение почты, затем войдите.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
