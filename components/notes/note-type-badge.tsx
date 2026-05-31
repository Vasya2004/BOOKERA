import type { NoteType } from "@/types/database";
import { cn } from "@/lib/utils/cn";

const labels: Record<NoteType, string> = {
  insight: "Инсайт",
  quote: "Цитата",
  idea: "Идея",
  action: "Действие",
  question: "Вопрос",
};

const typeColors: Record<NoteType, string> = {
  insight: "border-[#dca64d]/60 bg-[#fff0c7] text-[#7b4f16]",
  quote: "border-[#b9c6df] bg-[#eef4ff] text-[#183057]",
  idea: "border-[#e2c68b] bg-[#fff7e6] text-[#6a4a17]",
  action: "border-[#97bda7] bg-[#e8f2ec] text-[#28513d]",
  question: "border-[#9baed1] bg-[#edf2fb] text-[#263d68]",
};

export function noteTypeLabel(type: NoteType) {
  return labels[type];
}

export function NoteTypeBadge({ type, className }: { type: NoteType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
        typeColors[type],
        className,
      )}
    >
      {labels[type]}
    </span>
  );
}
