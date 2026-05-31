import { NextResponse } from "next/server";
import { requireUser } from "@/server/actions/auth-helpers";

export async function GET() {
  const { supabase, user } = await requireUser();
  const [books, notes, tags, bookTags] = await Promise.all([
    supabase.from("books").select("*").eq("user_id", user.id),
    supabase.from("notes").select("*").eq("user_id", user.id),
    supabase.from("tags").select("*").eq("user_id", user.id),
    supabase.from("book_tags").select("*").eq("user_id", user.id),
  ]);

  const failed = [books, notes, tags, bookTags].find((result) => result.error);
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    books: books.data,
    notes: notes.data,
    tags: tags.data,
    bookTags: bookTags.data,
  });
}
