"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/server/actions/result";

type ConfirmDeleteDialogProps = {
  label?: string;
  action: () => Promise<ActionResult>;
};

export function ConfirmDeleteDialog({
  label = "Удалить",
  action,
}: ConfirmDeleteDialogProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        className="px-3 text-destructive"
        onClick={() => setConfirming(true)}
      >
        <Trash2 className="h-4 w-4" />
        {label}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="destructive"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await action();
            if (result.ok) {
              toast.success(result.message ?? "Удалено");
            } else {
              toast.error(result.message);
            }
          });
        }}
      >
        Да
      </Button>
      <Button variant="secondary" onClick={() => setConfirming(false)}>
        Нет
      </Button>
    </div>
  );
}
