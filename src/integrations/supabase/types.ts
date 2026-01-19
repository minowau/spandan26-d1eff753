export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          sport_id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          sport_id: string
          username?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          sport_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          id: string
          name: string
          sport_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          sport_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          sport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          group_name: string | null
          id: string
          live_stream_url: string | null
          match_date: string
          match_name: string
          match_time: string
          match_type: string | null
          sport_id: string
          status: string | null
          team_a: string | null
          team_b: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          group_name?: string | null
          id?: string
          live_stream_url?: string | null
          match_date: string
          match_name: string
          match_time: string
          match_type?: string | null
          sport_id: string
          status?: string | null
          team_a?: string | null
          team_b?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          group_name?: string | null
          id?: string
          live_stream_url?: string | null
          match_date?: string
          match_name?: string
          match_time?: string
          match_type?: string | null
          sport_id?: string
          status?: string | null
          team_a?: string | null
          team_b?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          fest_start_date: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fest_start_date?: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fest_start_date?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sports: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          draw_points: number | null
          icon: string
          id: string
          live_stream_url: string | null
          loss_points: number | null
          name: string
          uses_gd: boolean | null
          uses_nrr: boolean | null
          uses_pd: boolean | null
          win_points: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          draw_points?: number | null
          icon?: string
          id: string
          live_stream_url?: string | null
          loss_points?: number | null
          name: string
          uses_gd?: boolean | null
          uses_nrr?: boolean | null
          uses_pd?: boolean | null
          win_points?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          draw_points?: number | null
          icon?: string
          id?: string
          live_stream_url?: string | null
          loss_points?: number | null
          name?: string
          uses_gd?: boolean | null
          uses_nrr?: boolean | null
          uses_pd?: boolean | null
          win_points?: number | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string | null
          draws: number | null
          goal_difference: number | null
          group_id: string
          id: string
          losses: number | null
          matches_played: number | null
          name: string
          net_run_rate: number | null
          point_difference: number | null
          points: number | null
          wins: number | null
        }
        Insert: {
          created_at?: string | null
          draws?: number | null
          goal_difference?: number | null
          group_id: string
          id?: string
          losses?: number | null
          matches_played?: number | null
          name: string
          net_run_rate?: number | null
          point_difference?: number | null
          points?: number | null
          wins?: number | null
        }
        Update: {
          created_at?: string | null
          draws?: number | null
          goal_difference?: number | null
          group_id?: string
          id?: string
          losses?: number | null
          matches_played?: number | null
          name?: string
          net_run_rate?: number | null
          point_difference?: number | null
          points?: number | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
