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
      // Ensure role exists (super or mestre)
      const desiredRole = data.kind === "clovis" ? "mestre" : "super";
      const { data: existingRoles } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", existingId);
      const hasRole = (existingRoles ?? []).some(
        (r: { role: string }) => r.role === desiredRole,
      );
      if (!hasRole) {
        await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: existingId, role: desiredRole });
      }
    }

    return { email, password };
  });