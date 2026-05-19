"use client";

import { useActionState } from "react";
import { updateProfile } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/server/actions/result";

const initialState: ActionResult = { ok: true };

export function ProfileForm({
  fullName,
  avatarUrl,
}: {
  fullName: string;
  avatarUrl: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <Card className="p-4 sm:p-5">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Имя</Label>
          <Input id="fullName" name="fullName" defaultValue={fullName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatarUrl">Avatar URL</Label>
          <Input id="avatarUrl" name="avatarUrl" defaultValue={avatarUrl} />
        </div>
        {!state.ok ? (
          <p className="text-sm text-destructive">{state.message}</p>
        ) : state.message ? (
          <p className="text-sm text-muted-foreground">{state.message}</p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          Сохранить профиль
        </Button>
      </form>
    </Card>
  );
}
