export const ALUNO_EMAIL_DOMAIN = "aluno.afc.local";

/** Normaliza o nome completo para um identificador único (sem acentos/símbolos). */
export function nomeSlug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function alunoEmail(nome: string): string {
  return `${nomeSlug(nome)}@${ALUNO_EMAIL_DOMAIN}`;
}

/**
 * E-mail interno do aluno com escopo da academia. Cada academia é
 * independente, então o mesmo nome pode existir em academias diferentes.
 */
export function alunoEmailFor(nome: string, academiaSlug: string | null | undefined): string {
  const slug = nomeSlug(nome);
  if (!academiaSlug) return `${slug}@${ALUNO_EMAIL_DOMAIN}`;
  return `${slug}.${nomeSlug(academiaSlug)}@${ALUNO_EMAIL_DOMAIN}`;
}
