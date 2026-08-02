import { useEffect, useState } from "react";
import { LifeBuoy, X, MessageSquare, BookOpen, Send, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { COLORS, camoStyle, useAfc } from "@/lib/afc";
import { Button, Eyebrow, Field, StencilHeading, inputStyle } from "@/components/afc-ui";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Como aprovo um novo aluno?",
    a: "Painel do Mestre → aba Alunos. Alunos pendentes aparecem no topo: defina a faixa inicial, crie a senha e clique em Aprovar.",
  },
  {
    q: "Como cadastro uma técnica?",
    a: "Abra a faixa desejada, escolha a categoria e use o botão Adicionar técnica. É possível anexar vídeo (YouTube/Vimeo) ou imagem e reordenar com as setas.",
  },
  {
    q: "Como mudo as faixas da minha modalidade?",
    a: "Painel do Mestre → aba Faixas. Você define nome, cores, ordem e requisitos de cada graduação — serve para qualquer arte marcial.",
  },
  {
    q: "Como altero o logo e as cores da academia?",
    a: "Painel do Mestre → aba Academia. Ali ficam logo, banner, cores, contatos, endereço e redes sociais.",
  },
  {
    q: "O aluno consegue ver dados de outro aluno?",
    a: "Não. Cada aluno vê apenas os próprios dados, e cada academia é totalmente isolada das demais.",
  },
  {
    q: "Como faço a chamada de presença?",
    a: "Painel do Mestre → aba Presença → Chamada rápida. Escolha data, turma (Infantil, Juvenil ou Adulto) e o tipo de aula.",
  },
];

const TUTORIAIS: { t: string; d: string }[] = [
  { t: "1. Configure a academia", d: "Logo, cores, contatos e horários na aba Academia." },
  { t: "2. Monte suas faixas", d: "Defina a ordem de graduação da sua modalidade na aba Faixas." },
  { t: "3. Cadastre as técnicas", d: "Organize por faixa e categoria, com vídeo ou imagem." },
  { t: "4. Aprove os alunos", d: "Cada aluno recebe login por nome completo e senha criada por você." },
  { t: "5. Rotina diária", d: "Chamada de presença, mensalidades e mural de avisos." },
];

type Aba = "faq" | "tutoriais" | "contato";

export function SuporteButton() {
  const { user, profile, academiaId } = useAfc();
  const [open, setOpen] = useState(false);
  const [aba, setAba] = useState<Aba>("faq");

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Suporte Martial Hub"
        className="fixed flex items-center gap-2 px-3 py-2 hover:brightness-125 active:scale-95"
        style={{
          left: 12,
          bottom: 12,
          zIndex: 45,
          background: COLORS.panel,
          border: `1px solid ${COLORS.olive}`,
          borderRadius: 2,
          color: COLORS.brass,
          fontFamily: "'Oswald', sans-serif",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          boxShadow: "0 4px 18px rgba(0,0,0,0.55)",
        }}
      >
        <LifeBuoy size={16} /> Suporte
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(5,6,4,0.75)" }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg max-h-[88vh] overflow-y-auto relative"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
          >
            <div className="h-1" style={camoStyle(1)} />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <Eyebrow>Central de suporte</Eyebrow>
                  <StencilHeading as="h2" className="text-xl">
                    Martial Hub
                  </StencilHeading>
                </div>
                <button onClick={() => setOpen(false)} style={{ color: COLORS.paperDim }}>
                  <X size={20} />
                </button>
              </div>

              <div
                className="flex gap-1 p-1 mb-4"
                style={{ background: COLORS.ink, border: `1px solid ${COLORS.line}` }}
              >
                {(
                  [
                    { k: "faq", label: "FAQ", icon: <MessageSquare size={13} /> },
                    { k: "tutoriais", label: "Tutoriais", icon: <BookOpen size={13} /> },
                    { k: "contato", label: "Contato", icon: <Send size={13} /> },
                  ] as { k: Aba; label: string; icon: React.ReactNode }[]
                ).map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setAba(t.k)}
                    className="flex-1 px-2 py-2 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    style={{
                      background: aba === t.k ? COLORS.olive : "transparent",
                      color: aba === t.k ? "#f2f0e6" : COLORS.paperDim,
                      fontFamily: "'Oswald', sans-serif",
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {aba === "faq" && (
                <div className="space-y-2">
                  {FAQ.map((f) => (
                    <details
                      key={f.q}
                      className="px-3 py-2"
                      style={{ background: COLORS.ink, border: `1px solid ${COLORS.line}` }}
                    >
                      <summary
                        className="cursor-pointer text-sm uppercase tracking-wide"
                        style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                      >
                        {f.q}
                      </summary>
                      <p className="mt-2 text-sm" style={{ color: COLORS.paperDim }}>
                        {f.a}
                      </p>
                    </details>
                  ))}
                </div>
              )}

              {aba === "tutoriais" && (
                <ol className="space-y-2">
                  {TUTORIAIS.map((t) => (
                    <li
                      key={t.t}
                      className="px-3 py-2"
                      style={{ background: COLORS.ink, border: `1px solid ${COLORS.line}` }}
                    >
                      <div
                        className="text-sm uppercase tracking-wide"
                        style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
                      >
                        {t.t}
                      </div>
                      <div className="text-sm" style={{ color: COLORS.paperDim }}>
                        {t.d}
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              {aba === "contato" && (
                <ContatoForm
                  userId={user.id}
                  nome={profile?.nome ?? ""}
                  academiaId={academiaId}
                  onSent={() => setOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ContatoForm({
  userId,
  nome,
  academiaId,
  onSent,
}: {
  userId: string;
  nome: string;
  academiaId: string | null;
  onSent: () => void;
}) {
  const [tipo, setTipo] = useState("duvida");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");

  const enviar = async () => {
    if (!assunto.trim()) {
      setErro("Informe o assunto.");
      return;
    }
    setBusy(true);
    setErro("");
    const { error } = await supabase.from("suporte_tickets").insert({
      user_id: userId,
      autor_nome: nome,
      academia_id: academiaId,
      tipo,
      assunto: assunto.trim(),
      mensagem: mensagem.trim(),
    });
    setBusy(false);
    if (error) {
      setErro(error.message);
      return;
    }
    onSent();
  };

  return (
    <div className="space-y-3">
      <Field label="Tipo">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyle}>
          <option value="duvida">Dúvida</option>
          <option value="problema">Problema técnico</option>
          <option value="sugestao">Sugestão</option>
          <option value="plano">Plano e cobrança</option>
        </select>
      </Field>
      <Field label="Assunto">
        <input value={assunto} onChange={(e) => setAssunto(e.target.value)} style={inputStyle} />
      </Field>
      <Field label="Mensagem">
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={4}
          style={inputStyle}
        />
      </Field>
      {erro && (
        <div className="text-xs" style={{ color: "#e08070" }}>
          {erro}
        </div>
      )}
      <Button variant="brass" onClick={() => void enviar()} disabled={busy}>
        <Send size={14} /> {busy ? "Enviando..." : "Enviar ao suporte"}
      </Button>
    </div>
  );
}

/** Faixa fixa com o comunicado global ativo mais recente do Martial Hub. */
export function ComunicadoBanner() {
  const { user } = useAfc();
  const [msg, setMsg] = useState<{ titulo: string; mensagem: string } | null>(null);
  const [fechado, setFechado] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    void supabase
      .from("comunicados_plataforma")
      .select("titulo,mensagem")
      .eq("ativo", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancel) setMsg((data as { titulo: string; mensagem: string } | null) ?? null);
      });
    return () => {
      cancel = true;
    };
  }, [user]);

  if (!msg || fechado) return null;
  return (
    <div
      className="flex items-start gap-2 px-4 py-2"
      style={{ background: COLORS.oliveDim, borderBottom: `1px solid ${COLORS.olive}` }}
    >
      <Megaphone size={16} color={COLORS.brass} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div
          className="text-xs uppercase tracking-widest"
          style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
        >
          {msg.titulo}
        </div>
        <div className="text-sm" style={{ color: COLORS.paper }}>
          {msg.mensagem}
        </div>
      </div>
      <button onClick={() => setFechado(true)} style={{ color: COLORS.paperDim }}>
        <X size={16} />
      </button>
    </div>
  );
}