import { createServerFn } from "@tanstack/react-start";

export type HubAcademia = {
  id: string;
  nome: string;
  slug: string;
  modalidade: string;
  logo_url: string;
  endereco: string;
  status: string;
  cor_primaria: string;
  cor_secundaria: string;
  created_at: string;
};

export type HubStats = {
  academias: number;
  mestres: number;
  professores: number;
  alunos: number;
  certificados: number;
  tecnicas: number;
};

export const getHubPortalData = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ academias: HubAcademia[]; stats: HubStats }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [academiasRes, mestres, limitados, alunos, certificados, tecnicas] = await Promise.all([
      supabaseAdmin
        .from("academias")
        .select(
          "id, nome, slug, modalidade, logo_url, endereco, status, cor_primaria, cor_secundaria, created_at",
        )
        .in("status", ["ativa", "teste"])
        .order("created_at", { ascending: true }),
      supabaseAdmin.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "mestre"),
      supabaseAdmin
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin_limitado"),
      supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "aprovado"),
      supabaseAdmin.from("certificados").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("techniques").select("*", { count: "exact", head: true }),
    ]);

    const academias = (academiasRes.data ?? []) as HubAcademia[];

    return {
      academias,
      stats: {
        academias: academias.length,
        mestres: mestres.count ?? 0,
        professores: limitados.count ?? 0,
        alunos: alunos.count ?? 0,
        certificados: certificados.count ?? 0,
        tecnicas: tecnicas.count ?? 0,
      },
    };
  },
);