"use client";

import { useActionState, useState } from "react";
import { signInWithPassword, signUpWithPassword } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/server/actions/result";

const initialState: ActionResult = { ok: true };

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <>
      <AuthModeForm key={mode} mode={mode} />
      <button
        type="button"
        className="mt-4 w-full text-center text-sm text-[#d8e2f7] transition hover:text-[#fff8ec]"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin"
          ? "Нет аккаунта? Зарегистрироваться"
          : "Уже есть аккаунт? Войти"}
      </button>
    </>
  );
}

function AuthModeForm({ mode }: { mode: "signin" | "signup" }) {
  const action = mode === "signin" ? signInWithPassword : signUpWithPassword;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Card className="p-5">
      <form action={formAction} className="space-y-4">
        {mode === "signup" ? (
          <div className="space-y-2">
            <Label htmlFor="fullName">Имя</Label>
            <Input id="fullName" name="fullName" autoComplete="name" />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={6}
            required
          />
        </div>
        {!state.ok ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.message}
          </p>
        ) : state.message ? (
          <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
            {state.message}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending
            ? mode === "signin"
              ? "Входим..."
              : "Создаём аккаунт..."
            : mode === "signin"
              ? "Войти"
              : "Создать аккаунт"}
        </Button>
      </form>
    </Card>
  );
}
