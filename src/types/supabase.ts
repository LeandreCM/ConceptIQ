export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          conceptiq_score: number;
          ability_score: number;
          growth_score: number;
          consistency_score: number;
          reaction_score: number;
          memory_score: number;
          pattern_score: number;
          domain_scores: Json | null;
          games_played: number;
          best_reaction_time: number | null;
          average_reaction_time: number | null;
          best_memory_score: number;
          best_pattern_score: number;
          max_games_in_session: number;
          fail_counts: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string;
          display_name?: string | null;
          conceptiq_score?: number;
          ability_score?: number;
          growth_score?: number;
          consistency_score?: number;
          reaction_score?: number;
          memory_score?: number;
          pattern_score?: number;
          domain_scores?: Json | null;
          games_played?: number;
          best_reaction_time?: number | null;
          average_reaction_time?: number | null;
          best_memory_score?: number;
          best_pattern_score?: number;
          max_games_in_session?: number;
          fail_counts?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      attempts: {
        Row: {
          id: string;
          user_id: string;
          game_type: "reaction" | "memory" | "pattern";
          raw_score: number;
          normalized_score: number;
          mistakes: number;
          duration_ms: number;
          score_before: number;
          score_after: number;
          score_change: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_type: "reaction" | "memory" | "pattern";
          raw_score: number;
          normalized_score: number;
          mistakes?: number;
          duration_ms?: number;
          score_before?: number;
          score_after?: number;
          score_change?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["attempts"]["Insert"]>;
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          target: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description: string;
          category: string;
          target: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["achievements"]["Insert"]>;
        Relationships: [];
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_achievements"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
