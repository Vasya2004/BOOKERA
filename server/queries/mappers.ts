import type { Note, Podcast, Tag } from "@/types/domain";
import type { NoteType, PodcastStatus } from "@/types/database";
import { getYouTubeThumbnailUrl } from "@/lib/youtube/utils";

type TagRelation = { tags: TagRow | TagRow[] | null };
type TagRow = { id: string; name: string; color: string | null };

export type PodcastRow = {
  id: string;
  youtube_url: string;
  youtube_video_id: string;
  title: string;
  channel_title: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  published_at: string | null;
  description: string | null;
  status: PodcastStatus;
  personal_rating: number | null;
  watched_at: string | null;
  main_takeaway: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
  notes?: { count: number }[];
  podcast_tags?: TagRelation[];
};

export type NoteRow = {
  id: string;
  podcast_id: string;
  type: NoteType;
  content: string;
  timestamp_seconds: number | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  note_tags?: TagRelation[];
  podcasts?: {
    id: string;
    title: string;
    channel_title: string | null;
    youtube_video_id: string;
  } | null;
};

export function mapTags(relations: TagRelation[] | undefined): Tag[] {
  return (relations ?? [])
    .flatMap((relation) =>
      Array.isArray(relation.tags) ? relation.tags : relation.tags ? [relation.tags] : [],
    )
    .map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
    }));
}

export function mapPodcast(row: PodcastRow): Podcast {
  return {
    id: row.id,
    youtubeUrl: row.youtube_url,
    youtubeVideoId: row.youtube_video_id,
    title: row.title,
    channelTitle: row.channel_title,
    thumbnailUrl: row.thumbnail_url ?? getYouTubeThumbnailUrl(row.youtube_video_id),
    durationSeconds: row.duration_seconds,
    publishedAt: row.published_at,
    description: row.description,
    status: row.status,
    personalRating: row.personal_rating,
    watchedAt: row.watched_at,
    mainTakeaway: row.main_takeaway,
    summary: row.summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: mapTags(row.podcast_tags),
    notesCount: row.notes?.[0]?.count ?? 0,
  };
}

export function mapNote(row: NoteRow): Note {
  return {
    id: row.id,
    podcastId: row.podcast_id,
    type: row.type,
    content: row.content,
    timestampSeconds: row.timestamp_seconds,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: mapTags(row.note_tags),
    podcast: row.podcasts
      ? {
          id: row.podcasts.id,
          title: row.podcasts.title,
          channelTitle: row.podcasts.channel_title,
          youtubeVideoId: row.podcasts.youtube_video_id,
        }
      : undefined,
  };
}
