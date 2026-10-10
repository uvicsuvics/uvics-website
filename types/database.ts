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
      departments: {
        Row: {
          active: boolean;
          created_at: string;
          description: string | null;
          display_order: number;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      members: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      membership_histories: {
        Row: {
          created_at: string;
          department_id: string;
          id: string;
          member_id: string;
          organization_period_id: string;
          position_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          department_id: string;
          id?: string;
          member_id: string;
          organization_period_id: string;
          position_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          department_id?: string;
          id?: string;
          member_id?: string;
          organization_period_id?: string;
          position_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "membership_histories_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "membership_histories_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "membership_histories_organization_period_id_fkey";
            columns: ["organization_period_id"];
            isOneToOne: false;
            referencedRelation: "organization_periods";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "membership_histories_position_id_fkey";
            columns: ["position_id"];
            isOneToOne: false;
            referencedRelation: "positions";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_periods: {
        Row: {
          created_at: string;
          end_date: string;
          id: string;
          name: string;
          start_date: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          end_date: string;
          id?: string;
          name: string;
          start_date: string;
          status: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          end_date?: string;
          id?: string;
          name?: string;
          start_date?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      positions: {
        Row: {
          active: boolean;
          created_at: string;
          description: string | null;
          display_order: number;
          id: string;
          level: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          level: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          level?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      competitions: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          slug: string;
          organizer: string;
          description: string;
          category: string | null;
          level: string | null;
          registration_deadline: string | null;
          competition_date: string | null;
          registration_url: string | null;
          guidebook_url: string | null;
          poster_url: string | null;
          team_size: string | null;
          eligibility: string | null;
          status: string;
          featured: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          slug: string;
          organizer: string;
          description?: string;
          category?: string | null;
          level?: string | null;
          registration_deadline?: string | null;
          competition_date?: string | null;
          registration_url?: string | null;
          guidebook_url?: string | null;
          poster_url?: string | null;
          team_size?: string | null;
          eligibility?: string | null;
          status?: string;
          featured?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          slug?: string;
          organizer?: string;
          description?: string;
          category?: string | null;
          level?: string | null;
          registration_deadline?: string | null;
          competition_date?: string | null;
          registration_url?: string | null;
          guidebook_url?: string | null;
          poster_url?: string | null;
          team_size?: string | null;
          eligibility?: string | null;
          status?: string;
          featured?: boolean;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          slug: string;
          competition_name: string;
          organizer: string | null;
          level: string | null;
          ranking: string;
          achievement_date: string;
          description: string;
          cover_image: string | null;
          certificate_file: string | null;
          published: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          slug: string;
          competition_name: string;
          organizer?: string | null;
          level?: string | null;
          ranking: string;
          achievement_date: string;
          description?: string;
          cover_image?: string | null;
          certificate_file?: string | null;
          published?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          slug?: string;
          competition_name?: string;
          organizer?: string | null;
          level?: string | null;
          ranking?: string;
          achievement_date?: string;
          description?: string;
          cover_image?: string | null;
          certificate_file?: string | null;
          published?: boolean;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          slug: string;
          summary: string;
          description: string;
          cover_image: string | null;
          project_url: string | null;
          repository_url: string | null;
          start_date: string | null;
          end_date: string | null;
          status: string;
          featured: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          slug: string;
          summary: string;
          description?: string;
          cover_image?: string | null;
          project_url?: string | null;
          repository_url?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: string;
          featured?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          slug?: string;
          summary?: string;
          description?: string;
          cover_image?: string | null;
          project_url?: string | null;
          repository_url?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: string;
          featured?: boolean;
        };
        Relationships: [];
      };
      achievement_members: {
        Row: {
          id: string;
          achievement_id: string;
          member_name: string;
          role: string;
        };
        Insert: {
          id?: string;
          achievement_id: string;
          member_name: string;
          role: string;
        };
        Update: {
          id?: string;
          achievement_id?: string;
          member_name?: string;
          role?: string;
        };
        Relationships: [];
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          member_name: string;
          role: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          member_name: string;
          role: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          member_name?: string;
          role?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
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
    Enums: Record<string, unknown>;
    CompositeTypes: Record<string, unknown>;
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
    | keyof (DefaultSchema["Enums"] & Record<string, unknown>)
    | { schema: keyof DatabaseWithoutInternals } = never,
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : keyof (DefaultSchema["Enums"] & Record<string, unknown>)) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof (DefaultSchema["Enums"] &
      Record<string, unknown>)
    ? (DefaultSchema["Enums"] & Record<string, unknown>)[EnumName]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof (DefaultSchema["CompositeTypes"] & Record<string, unknown>)
    | { schema: keyof DatabaseWithoutInternals } = never,
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : keyof (DefaultSchema["CompositeTypes"] & Record<string, unknown>)) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof (DefaultSchema["CompositeTypes"] &
      Record<string, unknown>)
    ? (DefaultSchema["CompositeTypes"] & Record<string, unknown>)[CompositeTypeName]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
