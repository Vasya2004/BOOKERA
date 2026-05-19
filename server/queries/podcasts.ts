import { requireUser } from "@/server/actions/auth-helpers";
import { mapNote, mapPodcast, type NoteRow, type PodcastRow } from "@/server/queries/mappers";
import type { Note, Podcast, Tag } from "@/types/domain";
import type { NoteType, PodcastStatus } from "@/types/database";

export type PodcastFilters = {
  q?: string;
  status?: PodcastStatus | "all";
  tag?: string;
  sort?: "new" | "watched" | "rating" | "updated";
};

const podcastSelect = `
  id,
  youtube_url,
  youtube_video_id,
  title,
  channel_title,
  thumbnail_url,
  duration_seconds,
  published_at,
  description,
  status,
  personal_rating,
  watched_at,
  main_takeaway,
  summary,
  created_at,
  updated_at,
  notes(count),
  podcast_tags(tags(id, name, color))
`;

export async function getPodcasts(filters: PodcastFilters = {}): Promise<Podcast[]> {
  const { supabase, user } = await requireUser();
  let query = supabase
    .from("podcasts")
    .select(podcastSelect)
    .eq("user_id", user.id);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.q) {
    query = query.or(
      `title.ilike.%${filters.q}%,channel_title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`,
    );
  }

  switch (filters.sort ?? "new") {
    case "watched":
      query = query.order("watched_at", { ascending: false, nullsFirst: false });
      break;
    case "rating":
      query = query.order("personal_rating", { ascending: false, nullsFirst: false });
      break;
    case "updated":
      query = query.order("updated_at", { ascending: false });
      break;
    case "new":
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const podcasts = (data as unknown as PodcastRow[]).map(mapPodcast);
  if (!filters.tag || filters.tag === "all") {
    return podcasts;
  }

  return podcasts.filter((podcast) =>
    podcast.tags.some((tag) => tag.id === filters.tag || tag.name === filters.tag),
  );
}

export async function getPodcast(id: string): Promise<Podcast | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("podcasts")
    .select(podcastSelect)
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapPodcast(data as unknown as PodcastRow) : null;
}

export async function getPodcastNotes(
  podcastId: string,
  type?: NoteType | "all",
): Promise<Note[]> {
  const { supabase, user } = await requireUser();
  let query = supabase
    .from("notes")
    .select(
      `
        id,
        podcast_id,
        type,
        content,
        timestamp_seconds,
        is_favorite,
        created_at,
        updated_at,
        note_tags(tags(id, name, color))
      `,
    )
    .eq("user_id", user.id)
    .eq("podcast_id", podcastId)
    .order("timestamp_seconds", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to load podcast notes", {
      podcastId,
      type: type ?? "all",
      error,
    });
    return [];
  }

  return (data as unknown as NoteRow[]).map(mapNote);
}

export async function getInsights(filters: {
  q?: string;
  type?: NoteType | "all";
  tag?: string;
  favorite?: boolean;
}): Promise<Note[]> {
  const { supabase, user } = await requireUser();
  let query = supabase
    .from("notes")
    .select(
      `
        id,
        podcast_id,
        type,
        content,
        timestamp_seconds,
        is_favorite,
        created_at,
        updated_at,
        note_tags(tags(id, name, color)),
        podcasts(id, title, channel_title, youtube_video_id)
      `,
    )
    .eq("user_id", user.id)
    .in("type", ["thought", "insight", "idea", "action", "quote"])
    .order("created_at", { ascending: false });

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters.favorite) {
    query = query.eq("is_favorite", true);
  }

  if (filters.q) {
    query = query.ilike("content", `%${filters.q}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const notes = (data as unknown as NoteRow[]).map(mapNote);
  if (!filters.tag || filters.tag === "all") {
    return notes;
  }

  return notes.filter((note) =>
    note.tags.some((tag) => tag.id === filters.tag || tag.name === filters.tag),
  );
}

export async function getTags(): Promise<Tag[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, color")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  }));
}

export async function getDashboardData() {
  const [podcasts, insights] = await Promise.all([
    getPodcasts({ sort: "new" }),
    getInsights({ favorite: false }),
  ]);

  return {
    stats: {
      watchedCount: podcasts.filter((podcast) => podcast.status === "watched").length,
      watchedHours: Math.round(
        podcasts
          .filter((podcast) => podcast.status === "watched")
          .reduce((total, podcast) => total + (podcast.durationSeconds ?? 0), 0) /
          3600,
      ),
      favoriteNotesCount: insights.filter((note) => note.isFavorite).length,
      insightsCount: insights.length,
    },
    recentPodcasts: podcasts.slice(0, 4),
    favoriteInsights: insights.filter((note) => note.isFavorite).slice(0, 5),
  };
}
