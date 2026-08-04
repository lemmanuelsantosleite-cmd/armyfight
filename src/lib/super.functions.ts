import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Resolve o e-mail interno da conta de Super Administrador a partir do
 * usuário/nome digitado. Nenhuma senha é validada aqui: a autenticação é
 * feita pelo banco (Supabase Auth) no cliente. Retorna null quando o usuário
 * informado não corresponde a nenhuma conta com o cargo `super`.
 */
export const resolveSuperEmail = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ usuario: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }): Promise<{ email: string | null }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "super");
    const superIds = new Set((roles ?? []).map((r: { user_id: string }) => r.user_id));
    if (superIds.size === 0) return { email: null };

    const alvo = data.usuario.trim().toLowerCase();

    for (let page = 1; page <= 20; page++) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      for (const u of list.users) {
        if (!superIds.has(u.id)) continue;
        const email = (u.email ?? "").toLowerCase();
        const local = email.split("@")[0] ?? "";
        const nome = String((u.user_metadata as { nome?: string } | null)?.nome ?? "").toLowerCase();
        if (alvo === email || alvo === local || alvo === nome || local.startsWith(`${alvo}.`)) {
          return { email: u.email ?? null };
        }
      }
      if (list.users.length < 200) break;
    }
    return { email: null };
  });
