const KEY = "mh_academia_id";
const KEY_NOME = "mh_academia_nome";

export function setSelectedAcademia(id: string, nome: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, id);
  window.localStorage.setItem(KEY_NOME, nome);
}

export function getSelectedAcademiaId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function getSelectedAcademiaNome(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY_NOME);
}

export function clearSelectedAcademia() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem(KEY_NOME);
}
