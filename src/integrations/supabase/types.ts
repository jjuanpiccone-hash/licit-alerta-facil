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
      alerts_sent: {
        Row: {
          channel: string
          error_message: string | null
          id: string
          sent_at: string
          status: string
          tender_id: string
          user_id: string
        }
        Insert: {
          channel?: string
          error_message?: string | null
          id?: string
          sent_at?: string
          status?: string
          tender_id: string
          user_id: string
        }
        Update: {
          channel?: string
          error_message?: string | null
          id?: string
          sent_at?: string
          status?: string
          tender_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_sent_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_type"]
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          plan?: Database["public"]["Enums"]["plan_type"]
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      tenders: {
        Row: {
          ai_summary: string | null
          category: string | null
          classified_at: string | null
          created_at: string
          currency: string | null
          deadline: string | null
          description: string | null
          estimated_amount: number | null
          external_id: string | null
          id: string
          organism: string
          published_at: string | null
          source_url: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          category?: string | null
          classified_at?: string | null
          created_at?: string
          currency?: string | null
          deadline?: string | null
          description?: string | null
          estimated_amount?: number | null
          external_id?: string | null
          id?: string
          organism: string
          published_at?: string | null
          source_url?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          category?: string | null
          classified_at?: string | null
          created_at?: string
          currency?: string | null
          deadline?: string | null
          description?: string | null
          estimated_amount?: number | null
          external_id?: string | null
          id?: string
          organism?: string
          published_at?: string | null
          source_url?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          categories: string[]
          keywords: string[]
          min_amount: number | null
          updated_at: string
          user_id: string
          whatsapp_enabled: boolean
        }
        Insert: {
          categories?: string[]
          keywords?: string[]
          min_amount?: number | null
          updated_at?: string
          user_id: string
          whatsapp_enabled?: boolean
        }
        Update: {
          categories?: string[]
          keywords?: string[]
          min_amount?: number | null
          updated_at?: string
          user_id?: string
          whatsapp_enabled?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      plan_type: "free" | "pro"
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
      plan_type: ["free", "pro"],
    },
  },
} as const
