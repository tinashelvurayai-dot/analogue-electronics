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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_code_usage: {
        Row: {
          code_id: string
          id: string
          used_at: string
          user_id: string
        }
        Insert: {
          code_id: string
          id?: string
          used_at?: string
          user_id: string
        }
        Update: {
          code_id?: string
          id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_code_usage_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      access_codes: {
        Row: {
          agent_name: string | null
          amount: number
          assigned_emails: string[]
          bound_user_id: string | null
          code: string
          created_at: string
          id: string
          notes: string | null
          total_seats: number
          used_seats: number
        }
        Insert: {
          agent_name?: string | null
          amount?: number
          assigned_emails?: string[]
          bound_user_id?: string | null
          code: string
          created_at?: string
          id?: string
          notes?: string | null
          total_seats?: number
          used_seats?: number
        }
        Update: {
          agent_name?: string | null
          amount?: number
          assigned_emails?: string[]
          bound_user_id?: string | null
          code?: string
          created_at?: string
          id?: string
          notes?: string | null
          total_seats?: number
          used_seats?: number
        }
        Relationships: []
      }
      access_requests: {
        Row: {
          access_code: string | null
          approved_at: string | null
          auto_password: string | null
          created_at: string
          email: string | null
          full_name: string
          generated_code: string | null
          id: string
          status: string
          synthetic_email: string | null
          user_id: string | null
          whatsapp: string
        }
        Insert: {
          access_code?: string | null
          approved_at?: string | null
          auto_password?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          generated_code?: string | null
          id?: string
          status?: string
          synthetic_email?: string | null
          user_id?: string | null
          whatsapp: string
        }
        Update: {
          access_code?: string | null
          approved_at?: string | null
          auto_password?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          generated_code?: string | null
          id?: string
          status?: string
          synthetic_email?: string | null
          user_id?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: boolean
          pair_amount: number
          primary_agent_name: string
          solo_amount: number
          updated_at: string
        }
        Insert: {
          id?: boolean
          pair_amount?: number
          primary_agent_name?: string
          solo_amount?: number
          updated_at?: string
        }
        Update: {
          id?: boolean
          pair_amount?: number
          primary_agent_name?: string
          solo_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          answer: string
          created_at: string
          difficulty: string
          id: string
          is_exam_only: boolean
          order_index: number
          question: string
          topic_set_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          difficulty?: string
          id?: string
          is_exam_only?: boolean
          order_index?: number
          question: string
          topic_set_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          difficulty?: string
          id?: string
          is_exam_only?: boolean
          order_index?: number
          question?: string
          topic_set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_topic_set_id_fkey"
            columns: ["topic_set_id"]
            isOneToOne: false
            referencedRelation: "topic_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_requests: {
        Row: {
          agent_name: string | null
          amount: number
          created_at: string
          id: string
          status: string
          student_email: string
          student_email_2: string | null
        }
        Insert: {
          agent_name?: string | null
          amount?: number
          created_at?: string
          id?: string
          status?: string
          student_email: string
          student_email_2?: string | null
        }
        Update: {
          agent_name?: string | null
          amount?: number
          created_at?: string
          id?: string
          status?: string
          student_email?: string
          student_email_2?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_level: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      study_notes: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          order_index: number
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          created_at: string
          id: string
          message: string
          replied_at: string | null
          status: string
          subject: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message: string
          replied_at?: string | null
          status?: string
          subject: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message?: string
          replied_at?: string | null
          status?: string
          subject?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      topic_sets: {
        Row: {
          created_at: string
          description: string | null
          free_card_limit: number
          id: string
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          free_card_limit?: number
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          free_card_limit?: number
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      admin_exists: { Args: never; Returns: boolean }
      claim_admin: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_access_code: { Args: { _code: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
