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
