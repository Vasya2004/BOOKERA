export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PodcastStatus = "want_to_watch" | "watching" | "watched";

export type NoteType =
  | "thought"
  | "insight"
  | "quote"
  | "action"
  | "question"
  | "idea";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      podcasts: {
        Row: {
          id: string;
          user_id: string;
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
        };
        Insert: {
          id?: string;
          user_id: string;
          youtube_url: string;
          youtube_video_id: string;
          title: string;
          channel_title?: string | null;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          published_at?: string | null;
          description?: string | null;
          status?: PodcastStatus;
          personal_rating?: number | null;
          watched_at?: string | null;
          main_takeaway?: string | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          youtube_url?: string;
          youtube_video_id?: string;
          title?: string;
          channel_title?: string | null;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          published_at?: string | null;
          description?: string | null;
          status?: PodcastStatus;
          personal_rating?: number | null;
          watched_at?: string | null;
          main_takeaway?: string | null;
          summary?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          podcast_id: string;
          type: NoteType;
          content: string;
          timestamp_seconds: number | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          podcast_id: string;
          type: NoteType;
          content: string;
          timestamp_seconds?: number | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: NoteType;
          content?: string;
          timestamp_seconds?: number | null;
          is_favorite?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          color?: string | null;
        };
        Relationships: [];
      };
      podcast_tags: {
        Row: {
          podcast_id: string;
          tag_id: string;
          user_id: string;
        };
        Insert: {
          podcast_id: string;
          tag_id: string;
          user_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      note_tags: {
        Row: {
          note_id: string;
          tag_id: string;
          user_id: string;
        };
        Insert: {
          note_id: string;
          tag_id: string;
          user_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      google_drive_connections: {
        Row: {
          user_id: string;
          access_token: string;
          refresh_token: string;
          token_expires_at: string;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          access_token: string;
          refresh_token: string;
          token_expires_at: string;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          access_token?: string;
          refresh_token?: string;
          token_expires_at?: string;
          last_synced_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
