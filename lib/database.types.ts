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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_recommendations: {
        Row: {
          audit_id: string | null
          automation_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          priority: number | null
        }
        Insert: {
          audit_id?: string | null
          automation_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
        }
        Update: {
          audit_id?: string | null
          automation_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_recommendations_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_recommendations_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_requests: {
        Row: {
          automation_goals: string | null
          budget: string | null
          company_name: string | null
          company_size: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          current_tools: string[] | null
          display_name: string | null
          first_name: string | null
          id: string
          industry: string | null
          integration_needs: string | null
          last_name: string | null
          location: string | null
          preferred_contact: string | null
          primary_pain: string | null
          source: string | null
          status: string | null
          submitted_at: string | null
          time_wasters: string[] | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          automation_goals?: string | null
          budget?: string | null
          company_name?: string | null
          company_size?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          current_tools?: string[] | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          industry?: string | null
          integration_needs?: string | null
          last_name?: string | null
          location?: string | null
          preferred_contact?: string | null
          primary_pain?: string | null
          source?: string | null
          status?: string | null
          submitted_at?: string | null
          time_wasters?: string[] | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          automation_goals?: string | null
          budget?: string | null
          company_name?: string | null
          company_size?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          current_tools?: string[] | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          industry?: string | null
          integration_needs?: string | null
          last_name?: string | null
          location?: string | null
          preferred_contact?: string | null
          primary_pain?: string | null
          source?: string | null
          status?: string | null
          submitted_at?: string | null
          time_wasters?: string[] | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      audits: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          lead_id: string | null
          meeting_link: string | null
          notes: string | null
          scheduled_at: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audits_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          base_price: number | null
          category: string | null
          created_at: string | null
          description: string | null
          estimated_hours_saved: number | null
          id: string
          implementation_complexity: string | null
          name: string
        }
        Insert: {
          base_price?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_hours_saved?: number | null
          id?: string
          implementation_complexity?: string | null
          name: string
        }
        Update: {
          base_price?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_hours_saved?: number | null
          id?: string
          implementation_complexity?: string | null
          name?: string
        }
        Relationships: []
      }
      client_automations: {
        Row: {
          automation_id: string | null
          client_id: string | null
          completed_at: string | null
          id: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          automation_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          automation_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_automations_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_automations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company_name: string
          contact_name: string
          created_at: string | null
          email: string
          id: string
          industry: string | null
          lead_id: string | null
          monthly_retainer: number | null
          onboarding_stage: string | null
          started_at: string | null
        }
        Insert: {
          company_name: string
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          industry?: string | null
          lead_id?: string | null
          monthly_retainer?: number | null
          onboarding_stage?: string | null
          started_at?: string | null
        }
        Update: {
          company_name?: string
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          industry?: string | null
          lead_id?: string | null
          monthly_retainer?: number | null
          onboarding_stage?: string | null
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          business_type: string | null
          company: string | null
          created_at: string | null
          email: string
          id: string
          metadata: Json | null
          name: string
          pain_point: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          business_type?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          name: string
          pain_point?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          business_type?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          name?: string
          pain_point?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          source: string | null
          status: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      pdf_access_logs: {
        Row: {
          accessed_at: string | null
          id: string
          pdf_id: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          id?: string
          pdf_id?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          id?: string
          pdf_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pdf_access_logs_pdf_id_fkey"
            columns: ["pdf_id"]
            isOneToOne: false
            referencedRelation: "pdf_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_access_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_library: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          download_count: number | null
          file_path: string
          id: string
          required_tier: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_path: string
          id?: string
          required_tier: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_path?: string
          id?: string
          required_tier?: string
          title?: string
        }
        Relationships: []
      }
      pdf_reports: {
        Row: {
          audit_id: string | null
          created_at: string | null
          file_path: string
          file_size: number | null
          file_url: string
          id: string
          sent_at: string | null
        }
        Insert: {
          audit_id?: string | null
          created_at?: string | null
          file_path: string
          file_size?: number | null
          file_url: string
          id?: string
          sent_at?: string | null
        }
        Update: {
          audit_id?: string | null
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          file_url?: string
          id?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pdf_reports_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string | null
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          tier: string
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          tier?: string
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          tier?: string
          updated_at?: string | null
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
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
