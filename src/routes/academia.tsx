import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Check, Target } from "lucide-react";
import { BELTS, CATEGORIES, COLORS, camoStyle, useAfc } from "@/lib/afc";
import logoAsset from "@/assets/afc-logo.png.asset.json";
import { Header } from "@/components/afc-header";
import { Sidebar } from "@/components/afc-sidebar";
import { AdminSettingsModal } from "@/components/afc-modals";
import { BeltSwatch, Eyebrow, StencilHeading } from "@/components/afc-ui";
import { Lock } from "lucide-react";
import {
  DestaqueCard,
  MuralAvisos,
  UltimasTecnicas,
  useAvisos,
  useDestaque,
  useTecnicasRecentes,
} from "@/components/afc-extras";

export const Route = createFileRoute("/academia")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Army Fight Club Hapkido — Biblioteca de Técnicas" },
      {
        name: "description",
        content:
          "Biblioteca digital de técnicas do Army Fight Club Hapkido: faixas com defesas pessoais, socos, chutes e quedas.",
      },
      { property: "og:title", content: "Army Fight Club Hapkido" },
      {
        property: "og:description",
        content: "Biblioteca digital de técnicas de Hapkido organizadas por faixa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

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
