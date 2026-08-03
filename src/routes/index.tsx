import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Users,
  Wallet,
  CalendarCheck,
  Award,
  FileCheck2,
  BarChart3,
  BookOpen,
  Building2,
  DatabaseBackup,
  ShieldCheck,
  ChevronRight,
  PlayCircle,
} from "lucide-react";
import bannerAsset from "@/assets/hub-banner.jpg";
import { HUB, HUB_SLOGAN, HUB_SUB } from "@/lib/hub-theme";
import { getHubPortalData } from "@/lib/hub.functions";
import { PLANOS } from "@/lib/afc";
import {
  HubCard,
  HubShell,
  SectionTitle,
  hubBtnClass,
  hubBtnStyle,
} from "@/components/hub-ui";

export const Route = createFileRoute("/")({
  component: HubPortal,
  head: () => ({
    meta: [
      { title: "Martial Hub — Gestão para academias de artes marciais" },
      {
        name: "description",
        content:
          "Martial Hub: plataforma completa de gestão para academias de artes marciais — alunos, financeiro, presença, graduações e certificados.",
      },
      { property: "og:title", content: "Martial Hub — Uma plataforma. Todas as artes marciais." },
      {
        property: "og:description",
        content:
          "Gerencie sua academia com tecnologia, segurança e praticidade. Tudo em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const RECURSOS = [
  { icon: Users, title: "Gestão completa de alunos", desc: "Cadastros, turmas, professores e graduações." },
  { icon: Wallet, title: "Financeiro", desc: "Mensalidades, planos e controle de pagamentos." },
  { icon: CalendarCheck, title: "Controle de presença", desc: "Chamada rápida por turma e frequência." },
  { icon: Award, title: "Exames e graduações", desc: "Organize exames e promova seus alunos." },
  { icon: FileCheck2, title: "Certificados digitais", desc: "Emissão automática com assinatura." },
  { icon: BarChart3, title: "Estatísticas", desc: "Relatórios e indicadores em tempo real." },
  { icon: BookOpen, title: "Biblioteca de técnicas", desc: "Vídeos e materiais por faixa." },
  { icon: Building2, title: "Multiacademias", desc: "Cada academia com ambiente independente." },
  { icon: DatabaseBackup, title: "Backup automático", desc: "Seus dados sempre preservados." },
  { icon: ShieldCheck, title: "Segurança de dados", desc: "Isolamento total e acesso controlado." },
];

function HubPortal() {
  const fetchPortal = useServerFn(getHubPortalData);
  const { data } = useQuery({ queryKey: ["hub-portal"], queryFn: () => fetchPortal({}) });
  const stats = data?.stats;
  const academias = data?.academias ?? [];

  const numeros = [
    { label: "Academias cadastradas", value: stats?.academias },
    { label: "Mestres ativos", value: stats?.mestres },
    { label: "Professores", value: stats?.professores },
    { label: "Alunos", value: stats?.alunos },
    { label: "Certificados emitidos", value: stats?.certificados },
    { label: "Técnicas cadastradas", value: stats?.tecnicas },
  ];

  return (
    <HubShell>
      <section className="relative overflow-hidden">
        <img
          src={bannerAsset}
          alt="Rede mundial de academias conectadas pelo Martial Hub"
          width={1920}
          height={960}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(100deg, ${HUB.graphite} 12%, rgba(18,18,18,0.75) 45%, rgba(10,27,61,0.45) 100%)`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-xl animate-fade-in">
            <span
              className="inline-block text-[11px] uppercase tracking-[0.3em] px-3 py-1 rounded-full"
              style={{ color: HUB.gold, border: `1px solid ${HUB.gold}55` }}
            >
              Plataforma SaaS
            </span>
            <h1
              className="mt-5 text-4xl sm:text-5xl font-bold leading-tight"
              style={{ color: HUB.white }}
            >
              O hub completo
              <br />
              das <span style={{ color: HUB.gold }}>artes marciais</span>
            </h1>
            <p className="mt-4 text-base" style={{ color: HUB.text }}>
              {HUB_SLOGAN}
            </p>
            <p className="mt-2 text-sm" style={{ color: HUB.textDim }}>
              {HUB_SUB}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/entrar" className={hubBtnClass} style={hubBtnStyle()}>
                Entrar <ChevronRight size={16} />
              </Link>
              <a href="#contato" className={hubBtnClass} style={hubBtnStyle("outline")}>
                Criar Academia
              </a>
              <a href="#recursos" className={hubBtnClass} style={hubBtnStyle("ghost")}>
                <PlayCircle size={16} /> Conheça a plataforma
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="max-w-7xl mx-auto px-4 py-16 sm:py-20 scroll-mt-20">
        <SectionTitle
          title="Recursos da plataforma"
          subtitle="Tudo que sua academia precisa, em um software profissional"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RECURSOS.map((r) => (
            <HubCard key={r.title}>
              <span
                className="grid h-11 w-11 place-items-center rounded-xl"
                style={{ background: `${HUB.navy}33`, border: `1px solid ${HUB.blue}44` }}
              >
                <r.icon size={20} color={HUB.blue} />
              </span>
              <div className="mt-4 font-semibold" style={{ color: HUB.white }}>
                {r.title}
              </div>
              <p className="mt-1 text-sm" style={{ color: HUB.textDim }}>
                {r.desc}
              </p>
            </HubCard>
          ))}
        </div>
      </section>

      <section className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <HubCard glow className="!p-8">
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 text-center">
              {numeros.map((n) => (
                <div key={n.label}>
                  <div className="text-3xl font-bold" style={{ color: HUB.gold }}>
                    {n.value ?? "—"}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: HUB.textDim }}>
                    {n.label}
                  </div>
                </div>
              ))}
            </div>
          </HubCard>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <SectionTitle title="Escolha sua academia" subtitle="Selecione a academia que deseja acessar" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {academias.map((a) => (
            <HubCard key={a.id} className="text-center">
              <div
                className="mx-auto grid h-20 w-20 place-items-center rounded-full overflow-hidden"
                style={{ background: "#0E1015", border: `1px solid ${HUB.line}` }}
              >
                {a.logo_url ? (
                  <img src={a.logo_url} alt={a.nome} className="h-full w-full object-contain" />
                ) : (
                  <Building2 size={26} color={HUB.gold} />
                )}
              </div>
              <div className="mt-4 font-semibold" style={{ color: HUB.white }}>
                {a.nome}
              </div>
              {a.endereco && (
                <div className="text-xs mt-1" style={{ color: HUB.textDim }}>
                  {a.endereco}
                </div>
              )}
              <div className="text-xs mt-1" style={{ color: HUB.blue }}>
                {a.modalidade}
              </div>
              <Link
                to="/academia"
                className={`${hubBtnClass} mt-5 w-full`}
                style={hubBtnStyle("outline")}
              >
                Entrar na academia
              </Link>
            </HubCard>
          ))}
          {academias.length === 0 && (
            <div className="text-sm col-span-full text-center" style={{ color: HUB.textDim }}>
              Nenhuma academia disponível no momento.
            </div>
          )}
        </div>
      </section>

      <section id="planos" className="max-w-7xl mx-auto px-4 py-16 sm:py-20 scroll-mt-20">
        <SectionTitle title="Planos" subtitle="Escolha o plano ideal para o tamanho da sua academia" />
        <div className="grid gap-5 sm:grid-cols-3">
          {PLANOS.map((p, i) => (
            <HubCard key={p.key} glow={i === 1}>
              <div className="text-xs uppercase tracking-[0.2em]" style={{ color: HUB.gold }}>
                {p.label}
              </div>
              <div className="mt-3 text-3xl font-bold" style={{ color: HUB.white }}>
                R$ {p.preco.toFixed(2).replace(".", ",")}
                <span className="text-sm font-normal" style={{ color: HUB.textDim }}>
                  {" "}
                  /mês
                </span>
              </div>
              <ul className="mt-5 space-y-2 text-sm" style={{ color: HUB.textDim }}>
                {p.recursos.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <ShieldCheck size={15} color={HUB.blue} className="mt-0.5 shrink-0" /> {r}
                  </li>
                ))}
              </ul>
              <a href="#contato" className={`${hubBtnClass} mt-6 w-full`} style={hubBtnStyle(i === 1 ? "primary" : "outline")}>
                Quero este plano
              </a>
            </HubCard>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <HubCard glow className="!p-8 grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold" style={{ color: HUB.gold }}>
              Tenha sua academia no Martial Hub
            </h3>
            <p className="mt-2 text-sm" style={{ color: HUB.textDim }}>
              Crie sua academia agora mesmo e simplifique a gestão do seu negócio.
            </p>
          </div>
          <a href="#contato" className={hubBtnClass} style={hubBtnStyle()}>
            Criar minha academia <ChevronRight size={16} />
          </a>
        </HubCard>
      </section>
    </HubShell>
  );
}

function Index() {
  const { data, hydrated, canAccessBelt, isMestre, user } = useAfc();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { avisos } = useAvisos();
  const { destaque } = useDestaque();
  const tecnicasRecentes = useTecnicasRecentes(6);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || !hydrated) return null;
    const out: {
      beltId: string;
      beltName: string;
      category: string;
      title: string;
    }[] = [];
    BELTS.forEach((b) => {
      CATEGORIES.forEach((c) => {
        (data[b.id]?.[c.key] ?? []).forEach((t) => {
          if (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) {
            out.push({
              beltId: b.id,
              beltName: b.name,
              category: c.label,
              title: t.title,
            });
          }
        });
      });
    });
    return out;
  }, [search, data, hydrated]);

  // Aluno é direcionado automaticamente para o painel pessoal
  if (hydrated && user && !isMestre) return <Navigate to="/aluno" />;

  return (
    <div className="min-h-screen" style={{ background: COLORS.ink }}>
      <Header
        onMenu={() => setMenuOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        search={search}
        setSearch={setSearch}
      />
      <div className="flex">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="flex-1 min-w-0">
          {searchResults ? (
            <section className="max-w-7xl mx-auto px-4 py-8">
              <Eyebrow>Resultados da busca</Eyebrow>
              <StencilHeading as="h1" className="text-2xl mb-4">
                “{search}” — {searchResults.length} resultado
                {searchResults.length === 1 ? "" : "s"}
              </StencilHeading>
              <div className="space-y-2">
                {searchResults.map((r, i) => (
                  <Link
                    key={i}
                    to="/belt/$beltId"
                    params={{ beltId: r.beltId }}
                    className="block p-3 hover:brightness-125"
                    style={{
                      background: COLORS.panel,
                      border: `1px solid ${COLORS.line}`,
                    }}
                  >
                    <div
                      className="text-sm uppercase font-semibold"
                      style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                    >
                      {r.title}
                    </div>
                    <div className="text-xs mt-1" style={{ color: COLORS.paperDim }}>
                      {r.beltName} · {r.category}
                    </div>
                  </Link>
                ))}
                {searchResults.length === 0 && (
                  <div className="text-sm" style={{ color: COLORS.paperDim }}>
                    Nenhuma técnica encontrada.
                  </div>
                )}
              </div>
            </section>
          ) : (
            <>
              <section
                className="relative overflow-hidden border-b"
                style={{ borderColor: COLORS.line }}
              >
                <div className="absolute inset-0" style={camoStyle(0.5)} />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg, rgba(233,228,208,0.05) 0 1px, transparent 1px 46px), repeating-linear-gradient(90deg, rgba(233,228,208,0.05) 0 1px, transparent 1px 46px)`,
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(10,11,7,0.4) 0%, rgba(10,11,7,0.96) 100%)",
                  }}
                />
                <div className="relative max-w-7xl mx-auto px-4 py-14 sm:py-20 animate-fade-in">
                  <div
                    className="inline-block mb-6 p-2 animate-scale-in"
                    style={{
                      background: COLORS.panel,
                      border: `1px solid ${COLORS.brassDim}`,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.55)",
                      clipPath:
                        "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                    }}
                  >
                    <img
                      src={logoAsset.url}
                      alt="Brasão Army Fight Club Hapkido"
                      className="h-20 sm:h-24 w-auto"
                    />
                  </div>
                  <Eyebrow>Biblioteca digital de técnicas</Eyebrow>
                  <StencilHeading
                    className="text-3xl sm:text-5xl md:text-6xl font-bold"
                    style={{ lineHeight: 0.95 }}
                  >
                    Army Fight Club
                    <br />
                    <span style={{ color: COLORS.brass }}>Hapkido</span>
                  </StencilHeading>
                  <div
                    className="mt-4 text-sm sm:text-base uppercase"
                    style={{
                      color: COLORS.brass,
                      fontFamily: "'Oswald', sans-serif",
                      letterSpacing: "0.25em",
                    }}
                  >
                    Disciplina • Técnica • Evolução
                  </div>
                  <p
                    className="mt-5 max-w-xl text-sm sm:text-base"
                    style={{ color: COLORS.paperDim }}
                  >
                    Doze faixas. Um único arquivo de missão. Consulte defesas pessoais, socos e
                    chutes organizados por graduação — do recruta faixa branca ao instrutor faixa
                    preta.
                  </p>
                  <a
                    href="#graduacoes"
                    className="inline-flex items-center gap-2 mt-7 px-6 py-3 text-sm font-semibold uppercase tracking-widest transition-all duration-150 hover:brightness-125 active:scale-95"
                    style={{
                      background: COLORS.brass,
                      color: "#14150f",
                      border: `1px solid ${COLORS.brassBright}`,
                      fontFamily: "'Oswald', sans-serif",
                      clipPath:
                        "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                  >
                    Iniciar jornada <ChevronRight size={16} />
                  </a>
                </div>
              </section>

              {(destaque || avisos.length > 0) && (
                <section className="max-w-7xl mx-auto px-4 pt-8 space-y-4">
                  {destaque && <DestaqueCard destaque={destaque} />}
                  {avisos.length > 0 && (
                    <div>
                      <StencilHeading as="h2" className="text-xl font-bold mb-3">
                        Mural de avisos do Mestre
                      </StencilHeading>
                      <MuralAvisos avisos={avisos.slice(0, 4)} />
                    </div>
                  )}
                </section>
              )}

              <UltimasTecnicas tecnicas={tecnicasRecentes} canAccessBelt={canAccessBelt} />

              <section id="graduacoes" className="max-w-7xl mx-auto px-4 py-10 scroll-mt-4">
                <div className="flex items-baseline justify-between mb-6">
                  <StencilHeading as="h2" className="text-xl font-bold">
                    Graduações
                  </StencilHeading>
                  <span
                    className="text-xs"
                    style={{ color: COLORS.paperDim, fontFamily: "'Oswald', sans-serif" }}
                  >
                    12 faixas
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {BELTS.map((belt) => {
                    const count = CATEGORIES.reduce(
                      (sum, c) => sum + (data[belt.id]?.[c.key]?.length || 0),
                      0,
                    );
                    const locked = !canAccessBelt(belt.id);
                    if (locked) {
                      return (
                        <div
                          key={belt.id}
                          className="text-left relative p-5 opacity-60 cursor-not-allowed"
                          style={{
                            background: COLORS.panel,
                            border: `1px solid ${COLORS.line}`,
                            clipPath:
                              "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                          }}
                          title="Faixa bloqueada — disponível após graduação"
                        >
                          <div className="absolute top-3 right-3">
                            <Lock size={16} color={COLORS.brass} />
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className="text-3xl font-bold"
                              style={{ color: COLORS.paperDim, fontFamily: "'Oswald', sans-serif" }}
                            >
                              {String(belt.n).padStart(2, "0")}
                            </span>
                          </div>
                          <BeltSwatch belt={belt} size="lg" />
                          <div
                            className="mt-3 text-base font-semibold uppercase tracking-wide"
                            style={{ color: COLORS.paperDim, fontFamily: "'Oswald', sans-serif" }}
                          >
                            {belt.name}
                          </div>
                          <div className="mt-1 text-xs" style={{ color: COLORS.paperDim }}>
                            Bloqueada
                          </div>
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={belt.id}
                        to="/belt/$beltId"
                        params={{ beltId: belt.id }}
                        className="text-left relative group p-5 transition-all duration-200 hover:-translate-y-1 animate-fade-in"
                        style={{
                          background: COLORS.panel,
                          border: `1px solid ${COLORS.line}`,
                          clipPath:
                            "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                        }}
                      >
                        <div
                          className="absolute top-3 right-3 w-2 h-2 rounded-full"
                          style={{
                            background: COLORS.oliveDim,
                            border: `1px solid ${COLORS.steelLight}`,
                          }}
                        />
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="text-3xl font-bold"
                            style={{
                              color: COLORS.oliveBright,
                              fontFamily: "'Oswald', sans-serif",
                            }}
                          >
                            {String(belt.n).padStart(2, "0")}
                          </span>
                          <ChevronRight
                            size={18}
                            color={COLORS.brass}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                        <BeltSwatch belt={belt} size="lg" />
                        <div
                          className="mt-3 text-base font-semibold uppercase tracking-wide"
                          style={{
                            color: COLORS.paper,
                            fontFamily: "'Oswald', sans-serif",
                          }}
                        >
                          {belt.name}
                        </div>
                        <div className="mt-1 text-xs" style={{ color: COLORS.paperDim }}>
                          {count} técnica{count === 1 ? "" : "s"}
                        </div>
                        <div
                          className="mt-3 pt-3 space-y-1"
                          style={{ borderTop: `1px dashed ${COLORS.line}` }}
                        >
                          <div
                            className="text-[10px] uppercase tracking-widest"
                            style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
                          >
                            Técnicas liberadas
                          </div>
                          {CATEGORIES.map((c) => {
                            const n = data[belt.id]?.[c.key]?.length ?? 0;
                            return (
                              <div
                                key={c.key}
                                className="flex items-center gap-1.5 text-[11px]"
                                style={{ color: n ? COLORS.paper : COLORS.paperDim }}
                              >
                                <Check size={11} color={n ? COLORS.oliveBright : COLORS.steelLight} />
                                {c.label}
                                <span style={{ color: COLORS.paperDim }}>({n})</span>
                              </div>
                            );
                          })}
                          <div
                            className="flex items-center gap-1.5 text-[11px] pt-1"
                            style={{ color: COLORS.paperDim }}
                          >
                            <Target size={11} color={COLORS.brass} />
                            Próximo:{" "}
                            {BELTS.find((b) => b.n === belt.n + 1)?.name ?? "Graduação máxima"}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
      {settingsOpen && <AdminSettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
