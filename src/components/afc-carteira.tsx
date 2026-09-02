import { useCallback, useEffect, useState } from "react";
import { Medal, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { COLORS, findBelt, type Profile } from "@/lib/afc";
import { Button, Field, inputStyle, StencilHeading, BeltSwatch } from "@/components/afc-ui";
import { BarraFrequencia, TURMAS, turmaOf } from "@/components/afc-turmas";
import { tenantId, withAcademia } from "@/lib/tenant";
import logoAsset from "@/assets/afc-logo.png.asset.json";

export type Conquista = {
  id: string;
  aluno_id: string;
  titulo: string;
  icone: string;
  descricao: string | null;
  data: string;
};

export const ICONES_CONQUISTA = ["🏅", "🔥", "🥋", "⭐", "🏆", "🎖️", "📜", "💯", "👑"];

export function useConquistas(alunoId?: string | null) {
  const [conquistas, setConquistas] = useState<Conquista[]>([]);

  const load = useCallback(async () => {
    if (!alunoId) {
      setConquistas([]);
      return;
    }
    const { data } = await supabase
      .from("conquistas")
      .select("*")
      .eq("academia_id", tenantId())
      .eq("aluno_id", alunoId)
      .order("data", { ascending: false });
    setConquistas((data ?? []) as unknown as Conquista[]);
  }, [alunoId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!alunoId) return;
    const ch = supabase
      .channel(`conquistas-${alunoId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conquistas", filter: `aluno_id=eq.${alunoId}` },
        () => void load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [alunoId, load]);

  return { conquistas, reload: load };
}

function tempoTreino(desde?: string | null) {
  if (!desde) return "—";
  const start = new Date(desde);
  const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 0) months = 0;
  const anos = Math.floor(months / 12);
  const meses = months % 12;
  const parts: string[] = [];
  if (anos) parts.push(`${anos} ano${anos > 1 ? "s" : ""}`);
  parts.push(`${meses} ${meses === 1 ? "mês" : "meses"}`);
  return parts.join(" e ");
}

/* ---------- Carteira do Guerreiro ---------- */

export function CarteiraGuerreiro({
  profile,
  frequencia,
  conquistas,
  proximoObjetivo,
}: {
  profile: Profile;
  frequencia: number;
  conquistas: number;
  proximoObjetivo?: string | null;
}) {
  const belt = findBelt(profile.faixa_id);
  const turma = TURMAS.find((t) => t.k === turmaOf(profile));

  return (
    <div
      className="relative overflow-hidden animate-scale-in"
      style={{
        background: `linear-gradient(135deg, ${COLORS.panel2} 0%, ${COLORS.panel} 60%, ${COLORS.oliveDim} 100%)`,
        border: `1px solid ${COLORS.brassDim}`,
        clipPath:
          "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))",
        boxShadow: "0 12px 28px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="absolute inset-y-0 left-0"
        style={{ width: 6, background: `linear-gradient(180deg, ${COLORS.brass}, ${COLORS.olive})` }}
      />
      <div className="p-4 sm:p-5 pl-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <div
              className="text-[10px] uppercase"
              style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.35em" }}
            >
              Army Fight Club
            </div>
            <div className="text-[10px] uppercase mb-3" style={{ color: COLORS.paperDim }}>
              Carteira do Guerreiro
            </div>
          </div>
          <img
            src={logoAsset.url}
            alt="Brasão Army Fight Club Hapkido"
            className="h-10 w-auto shrink-0 opacity-90"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div
            className="shrink-0 grid place-items-center overflow-hidden"
            style={{
              width: 78,
              height: 78,
              background: COLORS.ink,
              border: `1px solid ${COLORS.brassDim}`,
            }}
          >
            {profile.foto_url ? (
              <img
                src={profile.foto_url}
                alt={`Foto de ${profile.nome}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl">🥋</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase" style={{ color: COLORS.paperDim }}>
              Aluno
            </div>
            <div
              className="text-xl truncate"
              style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
            >
              {profile.nome}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {belt && <BeltSwatch belt={belt} size="md" />}
              <span className="text-xs" style={{ color: COLORS.brass }}>
                {belt?.name}
              </span>
            </div>
            {turma && (
              <div className="text-[11px] mt-1" style={{ color: COLORS.paperDim }}>
                {turma.icon} {turma.label}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <Dado label="Tempo de academia" valor={tempoTreino(profile.data_matricula)} />
          <div>
            <div className="text-[10px] uppercase" style={{ color: COLORS.paperDim }}>
              Presença
            </div>
            <div className="mt-1">
              <BarraFrequencia pct={frequencia} width={90} />
            </div>
          </div>
          <Dado label="Conquistas" valor={`🏅 ${conquistas}`} />
          <Dado label="Próximo objetivo" valor={proximoObjetivo ?? "—"} />
        </div>
      </div>
    </div>
  );
}

function Dado({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase" style={{ color: COLORS.paperDim }}>
        {label}
      </div>
      <div
        className="text-sm"
        style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
      >
        {valor}
      </div>
    </div>
  );
}

/* ---------- Medalhas (aluno) ---------- */

export function MedalhasConcedidas({ conquistas }: { conquistas: Conquista[] }) {
  if (!conquistas.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {conquistas.map((c) => (
        <div
          key={c.id}
          className="p-4 animate-scale-in"
          style={{
            background: COLORS.panel,
            border: `1px solid ${COLORS.brassDim}`,
          }}
        >
          <div className="text-2xl">{c.icone}</div>
          <div
            className="text-xs uppercase tracking-wider mt-2"
            style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
          >
            {c.titulo}
          </div>
          {c.descricao && (
            <div className="text-[10px] mt-1" style={{ color: COLORS.paperDim }}>
              {c.descricao}
            </div>
          )}
          <div className="text-[10px] mt-1" style={{ color: COLORS.paperDim }}>
            Concedida pelo Mestre
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Gestor de conquistas (Mestre) ---------- */

export function GestorConquistas({ alunoId }: { alunoId: string }) {
  const { conquistas, reload } = useConquistas(alunoId || null);
  const [titulo, setTitulo] = useState("");
  const [icone, setIcone] = useState(ICONES_CONQUISTA[0]);
  const [descricao, setDescricao] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!alunoId || !titulo.trim()) return;
    await supabase
      .from("conquistas")
      .insert(withAcademia({ aluno_id: alunoId, titulo: titulo.trim(), icone, descricao: descricao.trim() || null }));
    setTitulo("");
    setDescricao("");
    void reload();
  }

  async function remover(id: string) {
    await supabase.from("conquistas").delete().eq("id", id);
    void reload();
  }

  return (
    <div className="space-y-3">
      <StencilHeading as="h3" className="text-base flex items-center gap-2">
        <Medal size={16} color={COLORS.brass} /> Medalhas e conquistas
      </StencilHeading>
      <form
        onSubmit={add}
        className="p-3 grid grid-cols-1 sm:grid-cols-[90px_1fr_1fr_auto] gap-3 items-end"
        style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
      >
        <Field label="Ícone">
          <select style={inputStyle} value={icone} onChange={(e) => setIcone(e.target.value)}>
            {ICONES_CONQUISTA.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Título">
          <input
            style={inputStyle}
            value={titulo}
            placeholder="Ex.: 50 treinos realizados"
            onChange={(e) => setTitulo(e.target.value)}
          />
        </Field>
        <Field label="Descrição (opcional)">
          <input
            style={inputStyle}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </Field>
        <Button variant="brass" type="submit">
          <Plus size={14} /> Conceder
        </Button>
      </form>

      <div className="space-y-2">
        {conquistas.length === 0 && (
          <div
            className="p-4 text-sm text-center"
            style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
          >
            Nenhuma conquista concedida a este aluno.
          </div>
        )}
        {conquistas.map((c) => (
          <div
            key={c.id}
            className="p-3 flex items-center gap-3"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
          >
            <span className="text-xl">{c.icone}</span>
            <div className="flex-1 min-w-0">
              <div
                className="text-sm uppercase"
                style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
              >
                {c.titulo}
              </div>
              {c.descricao && (
                <div className="text-xs" style={{ color: COLORS.paperDim }}>
                  {c.descricao}
                </div>
              )}
            </div>
            <Button variant="danger" onClick={() => remover(c.id)}>
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
