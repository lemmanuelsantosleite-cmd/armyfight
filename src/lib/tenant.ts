/**
 * Escopo multiacademias (academy_id).
 *
 * Todo o Martial Hub é um único sistema compartilhado: o que separa uma
 * academia da outra é exclusivamente o `academia_id` da sessão ativa.
 * Este módulo guarda esse identificador e oferece helpers usados por
 * TODAS as consultas e cadastros do app, para que nenhuma operação
 * escape do escopo da academia atual.
 */

/** UUID impossível: usado quando não há academia ativa, garantindo 0 linhas. */
export const NO_ACADEMIA = "00000000-0000-0000-0000-000000000000";

let activeAcademiaId: string | null = null;

export function setActiveAcademiaId(id: string | null) {
  activeAcademiaId = id;
}

export function getActiveAcademiaId(): string | null {
  return activeAcademiaId;
}

/** Valor a ser usado em `.eq("academia_id", tenantId())`. */
export function tenantId(): string {
  return activeAcademiaId ?? NO_ACADEMIA;
}

/** Anexa o academia_id da sessão ativa a qualquer registro a ser inserido. */
export function withAcademia<T extends Record<string, unknown>>(row: T) {
  return { ...row, academia_id: tenantId() };
}
