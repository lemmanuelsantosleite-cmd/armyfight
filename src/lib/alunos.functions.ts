import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ALUNO_EMAIL_DOMAIN, nomeSlug } from "@/lib/slug";

/** Solicitação de cadastro do aluno: apenas o nome completo. */
export const solicitarCadastro = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ nome: z.string().trim().min(3).max(120) }).parse(input),
  )
  .handler(async ({ data }) => {
    const slug = nomeSlug(data.nome);
    if (slug.length < 3) throw new Error("Informe seu nome completo.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("nome_slug", slug)
      .maybeSingle();
    if (existing) throw new Error("Já existe um cadastro com esse nome completo.");

    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: `${slug}@${ALUNO_EMAIL_DOMAIN}`,
      password: crypto.randomUUID() + crypto.randomUUID(),
      email_confirm: true,
      user_metadata: { nome: data.nome.trim() },
    });
    if (error) {
      if (/already/i.test(error.message)) throw new Error("Já existe um cadastro com esse nome completo.");
      throw new Error(error.message);
    }
    return { ok: true as const };
  });

async function assertMestre(context: { supabase: any; userId: string }) {
  const { data: roles } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  const ok = (roles ?? []).some(
    (r: { role: string }) => r.role === "mestre" || r.role === "super",
  );
  if (!ok) throw new Error("Forbidden");
}

/** Somente o Mestre cria/redefine a senha de um aluno. */
export const definirSenhaAluno = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ alunoId: z.string().uuid(), senha: z.string().min(6).max(72) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertMestre(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.alunoId, {
      password: data.senha,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Rejeita/remove definitivamente uma solicitação de cadastro. */
export const rejeitarCadastro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ alunoId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertMestre(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.alunoId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
