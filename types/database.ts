export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BookStatus = "to_read" | "reading" | "finished";

export type NoteType =
  | "insight"
  | "quote"
  | "idea"
  | "action"
  | "question";

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
      books: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          author: string | null;
          cover_url: string | null;
          isbn: string | null;
          published_year: number | null;
          page_count: number | null;
          description: string | null;
          status: BookStatus;
          personal_rating: number | null;
          finished_at: string | null;
          main_takeaway: string | null;
          summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          author?: string | null;
          cover_url?: string | null;
          isbn?: string | null;
          published_year?: number | null;
          page_count?: number | null;
          description?: string | null;
          status?: BookStatus;
          personal_rating?: number | null;
          finished_at?: string | null;
          main_takeaway?: string | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          author?: string | null;
          cover_url?: string | null;
          isbn?: string | null;
          published_year?: number | null;
          page_count?: number | null;
          description?: string | null;
          status?: BookStatus;
          personal_rating?: number | null;
          finished_at?: string | null;
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
          book_id: string;
          type: NoteType;
          content: string;
          page_number: number | null;
          chapter_number: number | null;
          chapter_title: string | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          type: NoteType;
          content: string;
          page_number?: number | null;
          chapter_number?: number | null;
          chapter_title?: string | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: NoteType;
          content?: string;
          page_number?: number | null;
          chapter_number?: number | null;
          chapter_title?: string | null;
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
      book_tags: {
        Row: {
          book_id: string;
          tag_id: string;
          user_id: string;
        };
        Insert: {
          book_id: string;
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
