import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const COLORS = {
  ink: "#0a0b07",
  panel: "#14150f",
  panel2: "#1b1d13",
  olive: "#4b5320",
  oliveBright: "#6b7a2f",
  oliveDim: "#2c3012",
  steel: "#34362d",
  steelLight: "#4a4c40",
  brass: "#d1a72c",
  brassBright: "#f0c94a",
  brassDim: "#8a721f",
  paper: "#e9e4d0",
  paperDim: "#a8a48f",
  alert: "#a8321f",
  line: "#2a2c1f",
};

export type Belt = {
  id: string;
  n: number;
  name: string;
  grad: [string, string];
  text: string;
  dan?: number;
};

export const BELTS: Belt[] = [
  { id: "b01", n: 1, name: "Faixa Branca", grad: ["#f5f3ea", "#f5f3ea"], text: "#0a0b07" },
  { id: "b02", n: 2, name: "Faixa Amarela", grad: ["#e8c530", "#e8c530"], text: "#0a0b07" },
  { id: "b03", n: 3, name: "Faixa Amarela Ponta Verde", grad: ["#e8c530", "#4b7a3a"], text: "#0a0b07" },
  { id: "b04", n: 4, name: "Faixa Verde", grad: ["#3f7a35", "#3f7a35"], text: "#f2f0e6" },
  { id: "b05", n: 5, name: "Faixa Verde Ponta Azul", grad: ["#3f7a35", "#2f5f9e"], text: "#f2f0e6" },
  { id: "b06", n: 6, name: "Faixa Azul", grad: ["#2f5f9e", "#2f5f9e"], text: "#f2f0e6" },
  { id: "b07", n: 7, name: "Faixa Azul Ponta Vermelha", grad: ["#2f5f9e", "#a8321f"], text: "#f2f0e6" },
  { id: "b08", n: 8, name: "Faixa Vermelha", grad: ["#a8321f", "#a8321f"], text: "#f2f0e6" },
  { id: "b09", n: 9, name: "Faixa Vermelha Ponta Preta", grad: ["#a8321f", "#161610"], text: "#f2f0e6" },
  { id: "b10", n: 10, name: "Faixa Preta 1º Dan", grad: ["#161610", "#161610"], text: "#d1a72c", dan: 1 },
  { id: "b11", n: 11, name: "Faixa Preta 2º Dan", grad: ["#161610", "#161610"], text: "#d1a72c", dan: 2 },
  { id: "b12", n: 12, name: "Faixa Preta", grad: ["#161610", "#161610"], text: "#d1a72c", dan: 3 },
];

export type CategoryKey = "defesas" | "socos" | "chutes";

export const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
  { key: "defesas", label: "Defesas Pessoais", icon: "🥋" },
  { key: "socos", label: "Socos", icon: "👊" },
  { key: "chutes", label: "Chutes", icon: "🦵" },
];

export type Technique = {
  id: string;
  title: string;
  description: string;
  video: string;
  image: string;
};

export type TechniquesData = Record<string, Record<CategoryKey, Technique[]>>;

export type AdminCredentials = { name: string; password: string };

const STORAGE_KEY = "afc-hapkido-data-v1";
const ADMIN_STORAGE_KEY = "afc-hapkido-admin-v1";
const SESSION_KEY = "afc-hapkido-session-v1";

export const DEFAULT_ADMIN: AdminCredentials = {
  name: "Mestre Clóvis",
  password: "Clovishapkidoarmy",
};

export function seedTechniques(): TechniquesData {
  const data: TechniquesData = {};
  BELTS.forEach((belt) => {
    data[belt.id] = { defesas: [], socos: [], chutes: [] };
    CATEGORIES.forEach((cat) => {
      data[belt.id][cat.key] = [
        {
          id: `${belt.id}-${cat.key}-seed`,
          title: `Técnica exemplo — ${cat.label}`,
          description:
            "Ainda não há conteúdo cadastrado. O administrador pode editar, remover ou adicionar novas técnicas com vídeo, foto e explicação.",
          video: "",
          image: "",
        },
      ];
    });
  });
  return data;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadData(): TechniquesData {
  if (typeof window === "undefined") return seedTechniques();
  const stored = safeParse<TechniquesData | null>(localStorage.getItem(STORAGE_KEY), null);
  if (!stored) return seedTechniques();
  // Ensure every belt/category exists (schema-repair for older data)
  const seed = seedTechniques();
  BELTS.forEach((b) => {
    if (!stored[b.id]) stored[b.id] = seed[b.id];
    CATEGORIES.forEach((c) => {
      if (!stored[b.id][c.key]) stored[b.id][c.key] = [];
    });
  });
  return stored;
}

export function saveData(data: TechniquesData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadAdmin(): AdminCredentials {
  if (typeof window === "undefined") return DEFAULT_ADMIN;
  return safeParse<AdminCredentials>(localStorage.getItem(ADMIN_STORAGE_KEY), DEFAULT_ADMIN);
}

export function saveAdmin(a: AdminCredentials) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(a));
}

export function loadSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SESSION_KEY) === "1";
}

export function saveSession(v: boolean) {
  if (typeof window === "undefined") return;
  if (v) localStorage.setItem(SESSION_KEY, "1");
  else localStorage.removeItem(SESSION_KEY);
}

export function newId() {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* -------- Video URL helpers -------- */

export function isVideoEmbed(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url || "");
}

export function toEmbed(url: string) {
  if (!url) return "";
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

/* -------- Context -------- */

type AfcContextValue = {
  hydrated: boolean;
  data: TechniquesData;
  setData: (d: TechniquesData) => void;
  admin: AdminCredentials;
  setAdmin: (a: AdminCredentials) => void;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  // technique ops
  addTechnique: (beltId: string, cat: CategoryKey, t: Omit<Technique, "id">) => void;
  updateTechnique: (beltId: string, cat: CategoryKey, t: Technique) => void;
  deleteTechnique: (beltId: string, cat: CategoryKey, id: string) => void;
  moveTechnique: (beltId: string, cat: CategoryKey, id: string, dir: -1 | 1) => void;
};

const AfcContext = createContext<AfcContextValue | null>(null);

export function AfcProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [data, setDataState] = useState<TechniquesData>(() => seedTechniques());
  const [admin, setAdminState] = useState<AdminCredentials>(DEFAULT_ADMIN);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setDataState(loadData());
    setAdminState(loadAdmin());
    setIsAdmin(loadSession());
    setHydrated(true);
  }, []);

  const setData = (d: TechniquesData) => {
    setDataState(d);
    saveData(d);
  };
  const setAdmin = (a: AdminCredentials) => {
    setAdminState(a);
    saveAdmin(a);
  };
  const login = (password: string) => {
    if (password === admin.password) {
      setIsAdmin(true);
      saveSession(true);
      return true;
    }
    return false;
  };
  const logout = () => {
    setIsAdmin(false);
    saveSession(false);
  };

  const addTechnique: AfcContextValue["addTechnique"] = (beltId, cat, t) => {
    const next: TechniquesData = structuredClone(data);
    next[beltId][cat] = [...next[beltId][cat], { ...t, id: newId() }];
    setData(next);
  };
  const updateTechnique: AfcContextValue["updateTechnique"] = (beltId, cat, t) => {
    const next: TechniquesData = structuredClone(data);
    next[beltId][cat] = next[beltId][cat].map((x) => (x.id === t.id ? t : x));
    setData(next);
  };
  const deleteTechnique: AfcContextValue["deleteTechnique"] = (beltId, cat, id) => {
    const next: TechniquesData = structuredClone(data);
    next[beltId][cat] = next[beltId][cat].filter((x) => x.id !== id);
    setData(next);
  };
  const moveTechnique: AfcContextValue["moveTechnique"] = (beltId, cat, id, dir) => {
    const next: TechniquesData = structuredClone(data);
    const arr = next[beltId][cat];
    const idx = arr.findIndex((x) => x.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    setData(next);
  };

  return (
    <AfcContext.Provider
      value={{
        hydrated,
        data,
        setData,
        admin,
        setAdmin,
        isAdmin,
        login,
        logout,
        addTechnique,
        updateTechnique,
        deleteTechnique,
        moveTechnique,
      }}
    >
      {children}
    </AfcContext.Provider>
  );
}

export function useAfc() {
  const ctx = useContext(AfcContext);
  if (!ctx) throw new Error("useAfc must be used inside AfcProvider");
  return ctx;
}

export function camoStyle(opacity = 1): React.CSSProperties {
  return {
    backgroundImage: `
      radial-gradient(ellipse 180px 110px at 10% 20%, ${COLORS.oliveDim} 40%, transparent 41%),
      radial-gradient(ellipse 140px 160px at 35% 70%, ${COLORS.steel} 45%, transparent 46%),
      radial-gradient(ellipse 200px 120px at 65% 15%, ${COLORS.olive}55 40%, transparent 41%),
      radial-gradient(ellipse 160px 140px at 85% 60%, ${COLORS.oliveDim} 45%, transparent 46%),
      radial-gradient(ellipse 220px 130px at 50% 95%, ${COLORS.steel} 42%, transparent 43%),
      radial-gradient(ellipse 130px 130px at 95% 30%, ${COLORS.olive}44 40%, transparent 41%)`,
    backgroundColor: COLORS.ink,
    opacity,
  };
}

export function findBelt(id: string) {
  return BELTS.find((b) => b.id === id);
}