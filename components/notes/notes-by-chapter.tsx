import { NoteCard } from "@/components/notes/note-card";
import type { Note } from "@/types/domain";
import { groupNotesByChapter, normalizeChapterKey } from "@/lib/notes/chapters";

export function NotesByChapter({ notes }: { notes: Note[] }) {
  const groups = groupNotesByChapter(notes);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={normalizeChapterKey(group.label)} className="space-y-2.5">
          <div className="flex items-center gap-3">
            <h3 className="shrink-0 text-sm font-semibold text-foreground">{group.label}</h3>
            <div className="h-px flex-1 bg-border/70" />
            <span className="text-xs text-muted-foreground">{group.notes.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {group.notes.map((note) => (
              <NoteCard key={note.id} note={note} compact />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
