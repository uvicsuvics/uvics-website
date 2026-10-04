export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      achievement_members: {
        Row: {
          achievement_id: string;
          created_at: string;
          id: string;
          member_name: string;
          role: string | null;
        };
        Insert: {
          achievement_id: string;
          created_at?: string;
          id?: string;
          member_name: string;
          role?: string | null;
        };
        Update: {
          achievement_id?: string;
          created_at?: string;
          id?: string;
          member_name?: string;
          role?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "achievement_members_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
        ];
      };
      achievements: {
        Row: {
          certificate_file: string | null;
          competition_name: string;
          cover_image: string | null;
          created_at: string;
          description: string;
          id: string;
          level: string | null;
          organizer: string | null;
          published: boolean;
          ranking: string;
          slug: string;
          achievement_date: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          certificate_file?: string | null;
          competition_name: string;
          cover_image?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          level?: string | null;
          organizer?: string | null;
          published?: boolean;
          ranking: string;
          slug: string;
          achievement_date: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          certificate_file?: string | null;
          competition_name?: string;
          cover_image?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          level?: string | null;
          organizer?: string | null;
          published?: boolean;
          ranking?: string;
          slug?: string;
          achievement_date?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admins: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          last_login_at: string | null;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          is_active?: boolean;
          last_login_at?: string | null;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          last_login_at?: string | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          new_values: Json;
          old_values: Json;
          session_id: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          new_values?: Json;
          old_values?: Json;
          session_id?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          new_values?: Json;
          old_values?: Json;
          session_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "admins";
            referencedColumns: ["id"];
          },
        ];
      };
      competitions: {
        Row: {
          category: string | null;
          competition_date: string | null;
          created_at: string;
          description: string;
          eligibility: string | null;
          featured: boolean;
          guidebook_url: string | null;
          id: string;
          level: string | null;
          organizer: string;
          poster_url: string | null;
          registration_deadline: string | null;
          registration_url: string | null;
          slug: string;
          status: Database["public"]["Enums"]["competition_status"];
          team_size: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          competition_date?: string | null;
          created_at?: string;
          description?: string;
          eligibility?: string | null;
          featured?: boolean;
          guidebook_url?: string | null;
          id?: string;
          level?: string | null;
          organizer: string;
          poster_url?: string | null;
          registration_deadline?: string | null;
          registration_url?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["competition_status"];
          team_size?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          competition_date?: string | null;
          created_at?: string;
          description?: string;
          eligibility?: string | null;
          featured?: boolean;
          guidebook_url?: string | null;
          id?: string;
          level?: string | null;
          organizer?: string;
          poster_url?: string | null;
          registration_deadline?: string | null;
          registration_url?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["competition_status"];
          team_size?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          meta_description: string | null;
          meta_title: string | null;
          published_at: string | null;
          slug: string;
          status: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          content?: string;
          created_at?: string;
          id?: string;
          meta_description?: string | null;
          meta_title?: string | null;
          published_at?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          meta_description?: string | null;
          meta_title?: string | null;
          published_at?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["content_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          created_at: string;
          description: string;
          display_order: number;
          id: string;
          image: string | null;
          name: string;
          short_description: string | null;
          slug: string;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          display_order?: number;
          id?: string;
          image?: string | null;
          name: string;
          short_description?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          display_order?: number;
          id?: string;
          image?: string | null;
          name?: string;
          short_description?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      project_members: {
        Row: {
          created_at: string;
          id: string;
          member_name: string;
          project_id: string;
          role: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          member_name: string;
          project_id: string;
          role?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          member_name?: string;
          project_id?: string;
          role?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          cover_image: string | null;
          created_at: string;
          description: string;
          end_date: string | null;
          featured: boolean;
          id: string;
          project_url: string | null;
          repository_url: string | null;
          slug: string;
          start_date: string | null;
          status: Database["public"]["Enums"]["project_status"];
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          cover_image?: string | null;
          created_at?: string;
          description?: string;
          end_date?: string | null;
          featured?: boolean;
          id?: string;
          project_url?: string | null;
          repository_url?: string | null;
          slug: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          summary: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          cover_image?: string | null;
          created_at?: string;
          description?: string;
          end_date?: string | null;
          featured?: boolean;
          id?: string;
          project_url?: string | null;
          repository_url?: string | null;
          slug?: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      website_settings: {
        Row: {
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "website_settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admins";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [key: string]: never;
    };
    Functions: {
      begin_media_publication: {
        Args: {
          p_actor: string;
          p_intent: string;
          p_reference_id: string;
          p_reference_type: string;
          p_session: string;
        };
        Returns: Json;
      };
      complete_upload_intent: {
        Args: {
          p_actor: string;
          p_asset_id: string;
          p_bytes: number;
          p_format: string;
          p_height: number;
          p_intent: string;
          p_session: string;
          p_version: number;
          p_width: number;
        };
        Returns: Json;
      };
      consume_rate_limit: {
        Args: {
          p_namespace: string;
          p_operation: string;
          p_subject_hash: string;
        };
        Returns: Json;
      };
      create_upload_intent: {
        Args: {
          p_actor: string;
          p_category: string;
          p_kind: string;
          p_session: string;
        };
        Returns: Json;
      };
      fail_media_publication: {
        Args: { p_actor: string; p_intent: string; p_session: string };
        Returns: undefined;
      };
      finish_media_publication: {
        Args: {
          p_actor: string;
          p_asset_id: string;
          p_intent: string;
          p_session: string;
          p_version: number;
        };
        Returns: Json;
      };
      has_active_admin_session: { Args: never; Returns: boolean };
      publish_page: {
        Args: { p_id: string };
        Returns: undefined;
      };
      publish_program: {
        Args: { p_id: string };
        Returns: undefined;
      };
      read_upload_intent: {
        Args: { p_actor: string; p_intent: string; p_session: string };
        Returns: Json;
      };
      record_admin_login: { Args: never; Returns: undefined };
      reject_upload_intent: {
        Args: { p_actor: string; p_intent: string; p_session: string };
        Returns: undefined;
      };
    };
    Enums: {
      competition_status:
        | "UPCOMING"
        | "OPEN"
        | "CLOSED"
        | "ONGOING"
        | "FINISHED";
      content_status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      project_status: "PLANNED" | "ONGOING" | "COMPLETED" | "ARCHIVED";
    };
    CompositeTypes: {
      [key: string]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      competition_status: [
        "UPCOMING",
        "OPEN",
        "CLOSED",
        "ONGOING",
        "FINISHED",
      ],
      content_status: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      project_status: ["PLANNED", "ONGOING", "COMPLETED", "ARCHIVED"],
    },
  },
} as const;
