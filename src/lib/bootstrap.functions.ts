import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CLOVIS_EMAIL = "clovis@armyfightclub.local";
const CLOVIS_PASSWORD = "clovis1989!!";
const LUCAS_EMAIL = "lucas.admin@armyfightclub.local";
const LUCAS_PASSWORD = "Lucas2011!!";

/**
 * Ensures a fixed account exists and returns its login e-mail + password
 * so the client can call supabase.auth.signInWithPassword directly.
 *
 * kind = 'clovis'  → Mestre Clóvis (role mestre)
 * kind = 'lucas'   → super-admin oculto (role super)
 */
export const ensureFixedAccount = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ kind: z.enum(["clovis", "lucas"]) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = data.kind === "clovis" ? CLOVIS_EMAIL : LUCAS_EMAIL;
    const password = data.kind === "clovis" ? CLOVIS_PASSWORD : LUCAS_PASSWORD;
    const seed_role = data.kind === "clovis" ? "mestre" : "super";
    const nome = data.kind === "clovis" ? "Mestre Clóvis" : "Lucas";

    // Find existing user by email using admin listUsers (paged)
    let existingId: string | null = null;
    for (let page = 1; page <= 20 && !existingId; page++) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (error) throw error;
      const found = list.users.find((u) => u.email?.toLowerCase() === email);
      if (found) existingId = found.id;
      if (list.users.length < 200) break;
    }

    if (!existingId) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome, seed_role },
      });
      if (error) throw error;
      existingId = created.user!.id;
    } else {
      // Ensure password is the fixed one (idempotent reset)
      await supabaseAdmin.auth.admin.updateUserById(existingId, {
        password,
        email_confirm: true,
      });
    }

    // --- Restaura cargo, vínculo com a academia e perfil (idempotente) ---
    const desiredRole = data.kind === "clovis" ? "mestre" : "super";

    let academiaId: string | null = null;
    if (data.kind === "clovis") {
      const { data: ac } = await supabaseAdmin
        .from("academias")
        .select("id")
        .eq("slug", "army-fight-club")
        .maybeSingle();
      academiaId = (ac as { id: string } | null)?.id ?? null;
    }

    const { data: existingRoles } = await supabaseAdmin
      .from("user_roles")
      .select("id, role, academia_id")
      .eq("user_id", existingId);
    const roleRow = (existingRoles ?? []).find(
      (r: { role: string }) => r.role === desiredRole,
    ) as { id: string; academia_id: string | null } | undefined;

    if (!roleRow) {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: existingId, role: desiredRole, academia_id: academiaId });
    } else if (academiaId && roleRow.academia_id !== academiaId) {
      await supabaseAdmin
        .from("user_roles")
        .update({ academia_id: academiaId })
        .eq("id", roleRow.id);
    }

    if (data.kind === "clovis" && academiaId) {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("id, academia_id, status")
        .eq("id", existingId)
        .maybeSingle();

      if (!prof) {
        // nome_slug é único: usa um sufixo estável para não colidir com um
        // eventual perfil antigo do Mestre já existente na academia.
        await supabaseAdmin.from("profiles").insert({
          id: existingId,
          academia_id: academiaId,
          nome,
          nome_slug: "mestre-clovis-afc",
          email,
          faixa_id: "b12",
          status: "aprovado",
        });
      } else {
        await supabaseAdmin
          .from("profiles")
          .update({ academia_id: academiaId, status: "aprovado", bloqueado_inadimplencia: false })
          .eq("id", existingId);
      }
    }

    return { email, password };
  });