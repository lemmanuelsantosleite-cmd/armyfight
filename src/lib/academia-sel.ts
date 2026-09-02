/**
 * MODO ACADEMIA ÚNICA (Army Fight Club Hapkido).
 *
 * A arquitetura multiacademias continua intacta no banco de dados, mas nesta
 * fase a interface opera exclusivamente com a Army Fight Club. Por isso a
 * seleção de academia é fixa: qualquer parte do sistema que pergunte "qual é a
 * academia ativa?" recebe sempre a Army Fight Club.
 */

export const AFC_ACADEMIA_ID = "36bd332d-9b90-4a9d-bc82-e0b4a99dab80";
export const AFC_ACADEMIA_NOME = "Army Fight Club Hapkido";

export function setSelectedAcademia(_id?: string, _nome?: string) {
  // Modo academia única: seleção ignorada.
}

export function getSelectedAcademiaId(): string | null {
  return AFC_ACADEMIA_ID;
}

export function getSelectedAcademiaNome(): string | null {
  return AFC_ACADEMIA_NOME;
}

export function clearSelectedAcademia() {
  // Modo academia única: nada a limpar.
}
