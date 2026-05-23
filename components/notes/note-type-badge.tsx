import type { NoteType } from "@/types/database";
import { cn } from "@/lib/utils/cn";

const labels: Record<NoteType, string> = {
  thought: "Мысль",
  insight: "Инсайт",
  idea: "Идея",
  action: "Действие",
  question: "Вопрос",
};

const typeColors: Record<NoteType, string> = {
  thought: "border-slate-200 bg-slate-100 text-slate-700",
  insight: "border-blue-200 bg-blue-100 text-blue-700",
  idea: "border-rose-200 bg-rose-100 text-rose-700",
  action: "border-emerald-200 bg-emerald-100 text-emerald-700",
  question: "border-amber-200 bg-amber-100 text-amber-800",
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
