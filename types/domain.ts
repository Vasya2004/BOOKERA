import type { NoteType, PodcastStatus } from "@/types/database";

export type Tag = {
  id: string;
  name: string;
  color: string | null;
};

export type Podcast = {
  id: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  title: string;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  publishedAt: string | null;
  description: string | null;
  status: PodcastStatus;
  personalRating: number | null;
  watchedAt: string | null;
  mainTakeaway: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  notesCount: number;
};

export type Note = {
  id: string;
  podcastId: string;
  type: NoteType;
  content: string;
  timestampSeconds: number | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  podcast?: {
    id: string;
    title: string;
    channelTitle: string | null;
    youtubeVideoId: string;
  };
};

export type DashboardStats = {
  watchedCount: number;
  favoriteNotesCount: number;
  insightsCount: number;
};
