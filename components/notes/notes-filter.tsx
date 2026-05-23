"use client";

import type { NoteType } from "@/types/database";
import { Select } from "@/components/ui/select";

const types: Array<{ value: NoteType | "all"; label: string }> = [
  { value: "all", label: "Все заметки" },
  { value: "thought", label: "Мысли" },
  { value: "insight", label: "Инсайты" },
  { value: "idea", label: "Идеи" },
  { value: "action", label: "Действия" },
  { value: "question", label: "Вопросы" },
];

export function NotesFilter({ defaultValue = "all" }: { defaultValue?: string }) {
  return (
    <Select
      name="type"
      defaultValue={defaultValue}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
    >
      {types.map((type) => (
        <option key={type.value} value={type.value}>
          {type.label}
        </option>
      ))}
    </Select>
  );
}
