import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

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

const DEFAULT_BELTS: Belt[] = [
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

/**
 * Faixas ativas da academia atual. É um array vivo: o provider substitui o
 * conteúdo quando as faixas configuradas da academia são carregadas, para que
 * qualquer componente que já importa `BELTS` passe a usar a configuração real.
 */
export const BELTS: Belt[] = [...DEFAULT_BELTS];

export type AcademiaFaixa = {
  id: string;
  academia_id: string;
  codigo: string;
  nome: string;
  cor1: string;
  cor2: string;
  cor_texto: string;
  dan: number;
  posicao: number;
  requisitos: string;
};

export function faixasToBelts(faixas: AcademiaFaixa[]): Belt[] {
  return faixas
    .slice()
    .sort((a, b) => a.posicao - b.posicao)
    .map((f, i) => ({
      id: f.codigo,
      n: i + 1,
      name: f.nome,
      grad: [f.cor1, f.cor2] as [string, string],
      text: f.cor_texto,
      ...(f.dan > 0 ? { dan: f.dan } : {}),
    }));
}

function applyBelts(belts: Belt[]) {
  BELTS.splice(0, BELTS.length, ...(belts.length ? belts : DEFAULT_BELTS));
}

export type PlanoTipo = "basico" | "intermediario" | "completo";
export type AcademiaStatus = "pendente" | "teste" | "ativa" | "suspensa" | "rejeitada";

export const PLANOS: { key: PlanoTipo; label: string; preco: number; recursos: string[] }[] = [
  {
    key: "basico",
    label: "Básico",
    preco: 149.9,
    recursos: ["Até 50 alunos", "Técnicas e faixas", "Presença e mensalidade"],
  },
  {
    key: "intermediario",
    label: "Intermediário",
    preco: 249.9,
    recursos: ["Até 150 alunos", "Exames e certificados", "Conquistas e mural"],
  },
  {
    key: "completo",
    label: "Completo",
    preco: 349.9,
    recursos: ["Alunos ilimitados", "Identidade visual própria", "Relatórios completos"],
  },
];

export type Academia = {
  id: string;
  nome: string;
  slug: string;
  modalidade: string;
  logo_url: string;
  banner_url: string;
  cor_primaria: string;
  cor_secundaria: string;
  endereco: string;
  telefone: string;
  email: string;
  instagram: string;
  whatsapp: string;
  horarios: string;
  assinatura_url: string;
  plano: PlanoTipo;
  status: AcademiaStatus;
  max_alunos: number;
  observacao: string;
  created_at: string;
};

export type CategoryKey = "defesas" | "socos" | "chutes" | "quedas";

export const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
  { key: "defesas", label: "Defesas Pessoais", icon: "🥋" },
  { key: "socos", label: "Socos", icon: "👊" },
  { key: "chutes", label: "Chutes", icon: "🦵" },
  { key: "quedas", label: "Quedas", icon: "🤸" },
];

export type Technique = {
  id: string;
  title: string;
  description: string;
  video: string;
  image: string;
};

export type TechniquesData = Record<string, Record<CategoryKey, Technique[]>>;

export type AlunoStatus = "pendente" | "aprovado" | "bloqueado";
export type AppRole = "mestre" | "aluno" | "super" | "admin_limitado";

export type Profile = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  foto_url: string | null;
  data_nascimento: string | null;
  data_matricula: string;
  faixa_id: string;
  status: AlunoStatus;
  bloqueado_inadimplencia: boolean;
  turma?: "infantil" | "juvenil" | "adulto" | null;
};

function emptyBeltData(): TechniquesData {
  const data: TechniquesData = {};
  BELTS.forEach((belt) => {
    data[belt.id] = { defesas: [], socos: [], chutes: [], quedas: [] };
  });
  return data;
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
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  isMestre: boolean;
  isSuper: boolean;
  /** legacy alias kept for existing components */
  isAdmin: boolean;
  data: TechniquesData;
  academia: Academia | null;
  academiaId: string | null;
  faixas: AcademiaFaixa[];
  belts: Belt[];
  reloadAcademia: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  canAccessBelt: (beltId: string) => boolean;
  // technique ops (mestre only)
  addTechnique: (beltId: string, cat: CategoryKey, t: Omit<Technique, "id">) => Promise<void>;
  updateTechnique: (beltId: string, cat: CategoryKey, t: Technique) => Promise<void>;
  deleteTechnique: (beltId: string, cat: CategoryKey, id: string) => Promise<void>;
  moveTechnique: (beltId: string, cat: CategoryKey, id: string, dir: -1 | 1) => Promise<void>;
};

const AfcContext = createContext<AfcContextValue | null>(null);

type DbTechnique = {
  id: string;
  belt_id: string;
  categoria: CategoryKey;
  titulo: string;
  descricao: string;
  video_url: string;
  imagem_url: string;
  posicao: number;
};

function rowsToData(rows: DbTechnique[]): TechniquesData {
  const data = emptyBeltData();
  const sorted = rows.slice().sort((a, b) => a.posicao - b.posicao);
  sorted.forEach((r) => {
    if (!data[r.belt_id]) return;
    const arr = data[r.belt_id][r.categoria];
    if (!arr) return;
    arr.push({
      id: r.id,
      title: r.titulo,
      description: r.descricao,
      video: r.video_url,
      image: r.imagem_url,
    });
  });
  return data;
}

export function AfcProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [rows, setRows] = useState<DbTechnique[]>([]);
  const [academia, setAcademia] = useState<Academia | null>(null);
  const [faixas, setFaixas] = useState<AcademiaFaixa[]>([]);
  const rowsRef = useRef<DbTechnique[]>([]);
  rowsRef.current = rows;

  const academiaId = (profile as (Profile & { academia_id?: string }) | null)?.academia_id ?? null;

  const loadAcademia = useCallback(async (id: string | null) => {
    if (!id) {
      setAcademia(null);
      setFaixas([]);
      applyBelts([]);
      return;
    }
    const [{ data: a }, { data: f }] = await Promise.all([
      supabase.from("academias").select("*").eq("id", id).maybeSingle(),
      supabase.from("academia_faixas").select("*").eq("academia_id", id).order("posicao"),
    ]);
    setAcademia((a as Academia | null) ?? null);
    const list = (f ?? []) as AcademiaFaixa[];
    setFaixas(list);
    applyBelts(faixasToBelts(list));
  }, []);

  useEffect(() => {
    void loadAcademia(academiaId);
  }, [academiaId, loadAcademia]);

  const reloadAcademia = useCallback(async () => {
    await loadAcademia(academiaId);
  }, [academiaId, loadAcademia]);

  const loadProfileAndRole = useCallback(async (uid: string) => {
    const [{ data: p }, { data: rolesData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    const roles = (rolesData ?? []) as { role: AppRole }[];
    const isPrivileged =
      roles.some((r) => r.role === "super") || roles.some((r) => r.role === "mestre");

    let prof = (p as Profile | null) ?? null;

    // Self-heal: an aluno account must always have a profile row, otherwise the
    // app would render a blank screen forever.
    if (!prof && !isPrivileged) {
      const { data: authUser } = await supabase.auth.getUser();
      const u = authUser.user;
      if (u) {
        const meta = (u.user_metadata ?? {}) as Record<string, string | null>;
        await supabase.from("profiles").insert({
          id: u.id,
          nome: meta.nome || (u.email ?? "").split("@")[0],
          email: u.email ?? "",
          telefone: meta.telefone || null,
          data_nascimento: meta.data_nascimento || null,
          faixa_id: "b01",
          status: "pendente",
        });
        const { data: p2 } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.id)
          .maybeSingle();
        prof = (p2 as Profile | null) ?? null;
      }
    }

    setProfile(prof);
    if (roles.some((r) => r.role === "super")) setRole("super");
    else if (roles.some((r) => r.role === "mestre")) setRole("mestre");
    else setRole(roles[0]?.role ?? null);
  }, []);

  // Auth
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setHydrated(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Load profile whenever user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRole(null);
      return;
    }
    void loadProfileAndRole(user.id);
  }, [user, loadProfileAndRole]);

  // Load techniques whenever authenticated
  useEffect(() => {
    if (!user) {
      setRows([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const { data: t } = await supabase
        .from("techniques")
        .select("id,belt_id,categoria,titulo,descricao,video_url,imagem_url,posicao")
        .order("posicao", { ascending: true });
      if (!cancelled) setRows((t ?? []) as DbTechnique[]);
    };
    void load();

    const channel = supabase
      .channel("techniques-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "techniques" },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === "DELETE") {
              return prev.filter((r) => r.id !== (payload.old as DbTechnique).id);
            }
            const rec = payload.new as DbTechnique;
            const idx = prev.findIndex((r) => r.id === rec.id);
            if (idx === -1) return [...prev, rec];
            const copy = prev.slice();
            copy[idx] = rec;
            return copy;
          });
        },
      )
      .subscribe();

    const profileChannel = supabase
      .channel("profile-self")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => setProfile(payload.new as Profile),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      supabase.removeChannel(profileChannel);
    };
  }, [user]);

  const data = useMemo(() => rowsToData(rows), [rows]);

  const reloadTechniques = useCallback(async () => {
    const { data: t } = await supabase
      .from("techniques")
      .select("id,belt_id,categoria,titulo,descricao,video_url,imagem_url,posicao")
      .order("posicao", { ascending: true });
    setRows((t ?? []) as DbTechnique[]);
  }, []);

  const canAccessBelt = useCallback(
    (beltId: string) => {
      if (role === "mestre" || role === "super") return true;
      if (!profile) return false;
      const my = BELTS.find((b) => b.id === profile.faixa_id)?.n ?? 1;
      const target = BELTS.find((b) => b.id === beltId)?.n ?? 99;
      return target <= my;
    },
    [profile, role],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfileAndRole(user.id);
  }, [user, loadProfileAndRole]);

  const addTechnique: AfcContextValue["addTechnique"] = async (beltId, cat, t) => {
    const maxPos = rowsRef.current
      .filter((r) => r.belt_id === beltId && r.categoria === cat)
      .reduce((m, r) => Math.max(m, r.posicao), -1);
    const { error } = await supabase.from("techniques").insert({
      belt_id: beltId,
      categoria: cat,
      titulo: t.title,
      descricao: t.description,
      video_url: t.video,
      imagem_url: t.image,
      posicao: maxPos + 1,
      autor_nome: profile?.nome || "Mestre Clóvis",
    });
    if (error) throw new Error(error.message);
    await reloadTechniques();
  };

  const updateTechnique: AfcContextValue["updateTechnique"] = async (_belt, _cat, t) => {
    const { error } = await supabase
      .from("techniques")
      .update({
        titulo: t.title,
        descricao: t.description,
        video_url: t.video,
        imagem_url: t.image,
      })
      .eq("id", t.id);
    if (error) throw new Error(error.message);
    await reloadTechniques();
  };

  const deleteTechnique: AfcContextValue["deleteTechnique"] = async (_belt, _cat, id) => {
    const { error } = await supabase.from("techniques").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await reloadTechniques();
  };

  const moveTechnique: AfcContextValue["moveTechnique"] = async (beltId, cat, id, dir) => {
    const list = rowsRef.current
      .filter((r) => r.belt_id === beltId && r.categoria === cat)
      .sort((a, b) => a.posicao - b.posicao);
    const idx = list.findIndex((r) => r.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= list.length) return;
    const a = list[idx];
    const b = list[j];
    await Promise.all([
      supabase.from("techniques").update({ posicao: b.posicao }).eq("id", a.id),
      supabase.from("techniques").update({ posicao: a.posicao }).eq("id", b.id),
    ]);
    await reloadTechniques();
  };

  const isMestre = role === "mestre" || role === "super";
  const isSuper = role === "super";

  return (
    <AfcContext.Provider
      value={{
        hydrated,
        user,
        profile,
        role,
        isMestre,
        isSuper,
        isAdmin: isMestre,
        data,
        academia,
        academiaId,
        faixas,
        belts: faixasToBelts(faixas),
        reloadAcademia,
        signOut,
        refreshProfile,
        canAccessBelt,
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