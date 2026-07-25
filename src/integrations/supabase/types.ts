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
      admin_permissoes: {
        Row: {
          aprovar_alunos: boolean
          created_at: string
          criar_exame: boolean
          editar_exame: boolean
          editar_tecnicas: boolean
          emitir_certificado: boolean
          lancar_mensalidade: boolean
          marcar_presenca: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          aprovar_alunos?: boolean
          created_at?: string
          criar_exame?: boolean
          editar_exame?: boolean
          editar_tecnicas?: boolean
          emitir_certificado?: boolean
          lancar_mensalidade?: boolean
          marcar_presenca?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          aprovar_alunos?: boolean
          created_at?: string
          criar_exame?: boolean
          editar_exame?: boolean
          editar_tecnicas?: boolean
          emitir_certificado?: boolean
          lancar_mensalidade?: boolean
          marcar_presenca?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      exames: {
        Row: {
          aluno_id: string
          created_at: string
          data_exame: string
          faixa_atual: string
          faixa_proxima: string
          id: string
          observacao: string | null
          status: Database["public"]["Enums"]["exame_status"]
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data_exame: string
          faixa_atual: string
          faixa_proxima: string
          id?: string
          observacao?: string | null
          status?: Database["public"]["Enums"]["exame_status"]
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data_exame?: string
          faixa_atual?: string
          faixa_proxima?: string
          id?: string
          observacao?: string | null
          status?: Database["public"]["Enums"]["exame_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exames_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mensalidades: {
        Row: {
          aluno_id: string
          created_at: string
          id: string
          observacao: string | null
          pago_em: string | null
          status: Database["public"]["Enums"]["mensalidade_status"]
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          id?: string
          observacao?: string | null
          pago_em?: string | null
          status?: Database["public"]["Enums"]["mensalidade_status"]
          updated_at?: string
          valor: number
          vencimento: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          id?: string
          observacao?: string | null
          pago_em?: string | null
          status?: Database["public"]["Enums"]["mensalidade_status"]
          updated_at?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensalidades_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas: {
        Row: {
          aluno_id: string
          created_at: string
          data: string
          id: string
          observacao: string | null
          presente: boolean
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data: string
          id?: string
          observacao?: string | null
          presente?: boolean
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data?: string
          id?: string
          observacao?: string | null
          presente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "presencas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bloqueado_inadimplencia: boolean
          created_at: string
          data_matricula: string
          data_nascimento: string | null
          email: string
          faixa_id: string
          foto_url: string | null
          id: string
          nome: string
          status: Database["public"]["Enums"]["aluno_status"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          bloqueado_inadimplencia?: boolean
          created_at?: string
          data_matricula?: string
          data_nascimento?: string | null
          email: string
          faixa_id?: string
          foto_url?: string | null
          id: string
          nome: string
          status?: Database["public"]["Enums"]["aluno_status"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          bloqueado_inadimplencia?: boolean
          created_at?: string
          data_matricula?: string
          data_nascimento?: string | null
          email?: string
          faixa_id?: string
          foto_url?: string | null
          id?: string
          nome?: string
          status?: Database["public"]["Enums"]["aluno_status"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      techniques: {
        Row: {
          belt_id: string
          categoria: Database["public"]["Enums"]["tecnica_categoria"]
          created_at: string
          descricao: string
          id: string
          imagem_url: string
          posicao: number
          titulo: string
          updated_at: string
          video_url: string
        }
        Insert: {
          belt_id: string
          categoria: Database["public"]["Enums"]["tecnica_categoria"]
          created_at?: string
          descricao?: string
          id?: string
          imagem_url?: string
          posicao?: number
          titulo: string
          updated_at?: string
          video_url?: string
        }
        Update: {
          belt_id?: string
          categoria?: Database["public"]["Enums"]["tecnica_categoria"]
          created_at?: string
          descricao?: string
          id?: string
          imagem_url?: string
          posicao?: number
          titulo?: string
          updated_at?: string
          video_url?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_mestre: { Args: { _user_id: string }; Returns: boolean }
      is_super: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      aluno_status: "pendente" | "aprovado" | "bloqueado"
      app_role: "mestre" | "aluno" | "super" | "admin_limitado"
      exame_status: "agendado" | "aprovado" | "reprovado" | "cancelado"
      mensalidade_status: "pendente" | "pago" | "atrasado"
      tecnica_categoria: "defesas" | "socos" | "chutes" | "quedas"
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
      aluno_status: ["pendente", "aprovado", "bloqueado"],
      app_role: ["mestre", "aluno", "super", "admin_limitado"],
      exame_status: ["agendado", "aprovado", "reprovado", "cancelado"],
      mensalidade_status: ["pendente", "pago", "atrasado"],
      tecnica_categoria: ["defesas", "socos", "chutes", "quedas"],
    },
  },
} as const
