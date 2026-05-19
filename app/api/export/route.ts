import { NextResponse } from "next/server";
import { requireUser } from "@/server/actions/auth-helpers";

export async function GET() {
  const { supabase, user } = await requireUser();
  const [podcasts, notes, tags, podcastTags, noteTags] = await Promise.all([
    supabase.from("podcasts").select("*").eq("user_id", user.id),
    supabase.from("notes").select("*").eq("user_id", user.id),
    supabase.from("tags").select("*").eq("user_id", user.id),
    supabase.from("podcast_tags").select("*").eq("user_id", user.id),
    supabase.from("note_tags").select("*").eq("user_id", user.id),
  ]);

  const failed = [podcasts, notes, tags, podcastTags, noteTags].find((result) => result.error);
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    podcasts: podcasts.data,
    notes: notes.data,
    tags: tags.data,
    podcastTags: podcastTags.data,
    noteTags: noteTags.data,
  });
}
