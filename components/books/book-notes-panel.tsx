import { NotesByChapter } from "@/components/notes/notes-by-chapter";
import { NoteEditor } from "@/components/notes/note-editor";
import { DatabaseSetupCard } from "@/components/layout/database-setup-card";
import { EmptyState } from "@/components/ui/empty-state";
import { collectChapterTitles } from "@/lib/notes/chapters";
import { DatabaseSetupError, getBookNotes } from "@/server/queries/books";

export async function BookNotesPanel({ bookId }: { bookId: string }) {
  let notes;

  try {
    notes = await getBookNotes(bookId, "all");
  } catch (error) {
    if (error instanceof DatabaseSetupError) {
      return <DatabaseSetupCard message={error.message} />;
    }
    throw error;
  }

  const chapterTitles = collectChapterTitles(notes);

  return (
    <>
      <NoteEditor bookId={bookId} chapterTitles={chapterTitles} />
      {notes.length > 0 ? (
        <NotesByChapter notes={notes} />
      ) : (
        <EmptyState
          title="Пока пусто"
          description="Укажите главу и добавьте первую заметку — они сгруппируются по главам."
        />
      )}
    </>
  );
}
