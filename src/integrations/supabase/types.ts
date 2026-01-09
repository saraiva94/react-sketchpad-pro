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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          created_at: string
          id: string
          interesse: string
          nome: string
          project_id: string | null
          project_title: string | null
          status: string
          telefone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          interesse: string
          nome: string
          project_id?: string | null
          project_title?: string | null
          status?: string
          telefone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          interesse?: string
          nome?: string
          project_id?: string | null
          project_title?: string | null
          status?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      contrapartidas: {
        Row: {
          ativo: boolean
          beneficios: string[]
          created_at: string
          id: string
          indice: string | null
          ordem: number
          project_id: string
          titulo: string | null
          updated_at: string
          valor: string
        }
        Insert: {
          ativo?: boolean
          beneficios?: string[]
          created_at?: string
          id?: string
          indice?: string | null
          ordem?: number
          project_id: string
          titulo?: string | null
          updated_at?: string
          valor: string
        }
        Update: {
          ativo?: boolean
          beneficios?: string[]
          created_at?: string
          id?: string
          indice?: string | null
          ordem?: number
          project_id?: string
          titulo?: string | null
          updated_at?: string
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "contrapartidas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrapartidas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          created_at: string | null
          curriculum_url: string | null
          detalhes: string | null
          email: string | null
          funcao: string | null
          id: string
          nome: string
          order_index: number | null
          photo_url: string | null
          project_id: string
          social_links: Json | null
          telefone: string | null
        }
        Insert: {
          created_at?: string | null
          curriculum_url?: string | null
          detalhes?: string | null
          email?: string | null
          funcao?: string | null
          id?: string
          nome: string
          order_index?: number | null
          photo_url?: string | null
          project_id: string
          social_links?: Json | null
          telefone?: string | null
        }
        Update: {
          created_at?: string | null
          curriculum_url?: string | null
          detalhes?: string | null
          email?: string | null
          funcao?: string | null
          id?: string
          nome?: string
          order_index?: number | null
          photo_url?: string | null
          project_id?: string
          social_links?: Json | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_public"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          additional_info: string | null
          admin_notes: string | null
          awards: string[] | null
          budget: string | null
          card_image_url: string | null
          categorias_tags: string[] | null
          created_at: string
          description: string | null
          diferenciais: string | null
          featured_on_homepage: boolean | null
          festivals_exhibitions: Json | null
          has_incentive_law: boolean | null
          hero_image_url: string | null
          id: string
          image_url: string | null
          impacto_cultural: string | null
          impacto_social: string | null
          incentive_law_details: string | null
          is_hidden: boolean
          link_pagamento: string | null
          link_video: string | null
          location: string | null
          media_url: string | null
          news: Json | null
          order_index: number | null
          presentation_document_url: string | null
          project_type: string
          publico_alvo: string | null
          responsavel_email: string | null
          responsavel_genero: string | null
          responsavel_nome: string | null
          responsavel_telefone: string | null
          show_on_captacao: boolean | null
          show_on_portfolio: boolean | null
          stage: string | null
          stages: string[] | null
          status: Database["public"]["Enums"]["project_status"]
          synopsis: string
          title: string
          updated_at: string
          user_id: string
          valor_sugerido: number | null
        }
        Insert: {
          additional_info?: string | null
          admin_notes?: string | null
          awards?: string[] | null
          budget?: string | null
          card_image_url?: string | null
          categorias_tags?: string[] | null
          created_at?: string
          description?: string | null
          diferenciais?: string | null
          featured_on_homepage?: boolean | null
          festivals_exhibitions?: Json | null
          has_incentive_law?: boolean | null
          hero_image_url?: string | null
          id?: string
          image_url?: string | null
          impacto_cultural?: string | null
          impacto_social?: string | null
          incentive_law_details?: string | null
          is_hidden?: boolean
          link_pagamento?: string | null
          link_video?: string | null
          location?: string | null
          media_url?: string | null
          news?: Json | null
          order_index?: number | null
          presentation_document_url?: string | null
          project_type: string
          publico_alvo?: string | null
          responsavel_email?: string | null
          responsavel_genero?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          show_on_captacao?: boolean | null
          show_on_portfolio?: boolean | null
          stage?: string | null
          stages?: string[] | null
          status?: Database["public"]["Enums"]["project_status"]
          synopsis: string
          title: string
          updated_at?: string
          user_id?: string
          valor_sugerido?: number | null
        }
        Update: {
          additional_info?: string | null
          admin_notes?: string | null
          awards?: string[] | null
          budget?: string | null
          card_image_url?: string | null
          categorias_tags?: string[] | null
          created_at?: string
          description?: string | null
          diferenciais?: string | null
          featured_on_homepage?: boolean | null
          festivals_exhibitions?: Json | null
          has_incentive_law?: boolean | null
          hero_image_url?: string | null
          id?: string
          image_url?: string | null
          impacto_cultural?: string | null
          impacto_social?: string | null
          incentive_law_details?: string | null
          is_hidden?: boolean
          link_pagamento?: string | null
          link_video?: string | null
          location?: string | null
          media_url?: string | null
          news?: Json | null
          order_index?: number | null
          presentation_document_url?: string | null
          project_type?: string
          publico_alvo?: string | null
          responsavel_email?: string | null
          responsavel_genero?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          show_on_captacao?: boolean | null
          show_on_portfolio?: boolean | null
          stage?: string | null
          stages?: string[] | null
          status?: Database["public"]["Enums"]["project_status"]
          synopsis?: string
          title?: string
          updated_at?: string
          user_id?: string
          valor_sugerido?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      translations: {
        Row: {
          created_at: string | null
          id: string
          namespace: string
          quality_score: number | null
          source_hash: string
          source_language: string
          source_value: Json
          target_language: string
          translated_value: Json
          translation_method: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          namespace: string
          quality_score?: number | null
          source_hash: string
          source_language?: string
          source_value: Json
          target_language: string
          translated_value: Json
          translation_method?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          namespace?: string
          quality_score?: number | null
          source_hash?: string
          source_language?: string
          source_value?: Json
          target_language?: string
          translated_value?: Json
          translation_method?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      projects_public: {
        Row: {
          additional_info: string | null
          budget: string | null
          card_image_url: string | null
          categorias_tags: string[] | null
          created_at: string | null
          description: string | null
          diferenciais: string | null
          featured_on_homepage: boolean | null
          has_incentive_law: boolean | null
          hero_image_url: string | null
          id: string | null
          image_url: string | null
          impacto_cultural: string | null
          impacto_social: string | null
          incentive_law_details: string | null
          is_hidden: boolean | null
          link_pagamento: string | null
          link_video: string | null
          location: string | null
          media_url: string | null
          presentation_document_url: string | null
          project_type: string | null
          publico_alvo: string | null
          responsavel_primeiro_nome: string | null
          stage: string | null
          stages: string[] | null
          synopsis: string | null
          title: string | null
          updated_at: string | null
          valor_sugerido: number | null
        }
        Insert: {
          additional_info?: string | null
          budget?: string | null
          card_image_url?: string | null
          categorias_tags?: string[] | null
          created_at?: string | null
          description?: string | null
          diferenciais?: string | null
          featured_on_homepage?: boolean | null
          has_incentive_law?: boolean | null
          hero_image_url?: string | null
          id?: string | null
          image_url?: string | null
          impacto_cultural?: string | null
          impacto_social?: string | null
          incentive_law_details?: string | null
          is_hidden?: boolean | null
          link_pagamento?: string | null
          link_video?: string | null
          location?: string | null
          media_url?: string | null
          presentation_document_url?: string | null
          project_type?: string | null
          publico_alvo?: string | null
          responsavel_primeiro_nome?: never
          stage?: string | null
          stages?: string[] | null
          synopsis?: string | null
          title?: string | null
          updated_at?: string | null
          valor_sugerido?: number | null
        }
        Update: {
          additional_info?: string | null
          budget?: string | null
          card_image_url?: string | null
          categorias_tags?: string[] | null
          created_at?: string | null
          description?: string | null
          diferenciais?: string | null
          featured_on_homepage?: boolean | null
          has_incentive_law?: boolean | null
          hero_image_url?: string | null
          id?: string | null
          image_url?: string | null
          impacto_cultural?: string | null
          impacto_social?: string | null
          incentive_law_details?: string | null
          is_hidden?: boolean | null
          link_pagamento?: string | null
          link_video?: string | null
          location?: string | null
          media_url?: string | null
          presentation_document_url?: string | null
          project_type?: string | null
          publico_alvo?: string | null
          responsavel_primeiro_nome?: never
          stage?: string | null
          stages?: string[] | null
          synopsis?: string | null
          title?: string | null
          updated_at?: string | null
          valor_sugerido?: number | null
        }
        Relationships: []
      }
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
      app_role: "admin" | "user"
      project_status: "pending" | "approved" | "rejected"
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
      project_status: ["pending", "approved", "rejected"],
    },
  },
} as const
