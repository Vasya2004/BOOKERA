"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChapterPicker({
  bookId,
  chapters,
}: {
  bookId: string;
  chapters: string[];
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? chapters[0] ?? "";

  return (
    <div className="space-y-2">
      <Label htmlFor={`${bookId}-chapterTitle`} className="text-xs">
        Глава
      </Label>
      {chapters.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {chapters.map((chapter) => {
            const isActive = value === chapter;
            return (
              <button
                key={chapter}
                type="button"
                onClick={() => setDraft(chapter)}
                className={cn(
                  "max-w-full truncate rounded-full border px-2.5 py-1 text-xs font-medium transition",
                  isActive
                    ? "border-[#dca64d] bg-[#fff0c7] text-[#7b4f16]"
                    : "border-border bg-card text-muted-foreground hover:border-[#dca64d]/50 hover:text-foreground",
                )}
              >
                {chapter}
              </button>
            );
          })}
        </div>
      ) : null}
      <Input
        id={`${bookId}-chapterTitle`}
        name="chapterTitle"
        value={value}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={chapters.length > 0 ? "Или введите новую главу" : "Например: Введение"}
        className="h-9"
      />
    </div>
  );
}
