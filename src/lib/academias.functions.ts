import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { nomeSlug } from "@/lib/slug";

/**
 * Solicitação pública de criação de academia. A academia nasce vazia: sem
 * faixas, técnicas, alunos ou identidade visual — o Mestre monta tudo depois.
 * Fica com status `pendente` até a liberação do Super Administrador.
 */
export const solicitarAcademia = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        nome: z.string().trim().min(3).max(120),
        modalidade: z.string().trim().min(2).max(80),
        cidade: z.string().trim().max(120).optional().default(""),
        responsavel: z.string().trim().min(3).max(120),
        email: z.string().trim().email().max(160),
        telefone: z.string().trim().max(40).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const base = nomeSlug(data.nome);
    let slug = base;
    for (let i = 2; i < 50; i++) {
      const { data: existing } = await supabaseAdmin
        .from("academias")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${base}-${i}`;
    }

    const { error } = await supabaseAdmin.from("academias").insert({
      nome: data.nome,
      slug,
      modalidade: data.modalidade,
      endereco: data.cidade,
      email: data.email,
      telefone: data.telefone,
      status: "pendente",
      plano: "basico",
      max_alunos: 50,
      observacao: `Solicitada por ${data.responsavel}`,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
