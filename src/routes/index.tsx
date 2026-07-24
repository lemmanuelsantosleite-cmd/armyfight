import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { BELTS, CATEGORIES, COLORS, camoStyle, useAfc } from "@/lib/afc";
import { Header } from "@/components/afc-header";
import { Sidebar } from "@/components/afc-sidebar";
import { AdminSettingsModal } from "@/components/afc-modals";
import { BeltSwatch, Eyebrow, StencilHeading } from "@/components/afc-ui";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data, hydrated, canAccessBelt, isMestre, profile } = useAfc();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [search, setSearch] = useState("");

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
          if (
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q)
          ) {
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
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(10,11,7,0.4) 0%, rgba(10,11,7,0.96) 100%)",
                  }}
                />
                <div className="relative max-w-7xl mx-auto px-4 py-14 sm:py-20">
                  <Eyebrow>Biblioteca digital de técnicas</Eyebrow>
                  <StencilHeading
                    className="text-3xl sm:text-5xl md:text-6xl font-bold"
                    style={{ lineHeight: 0.95 }}
                  >
                    Army Fight Club
                    <br />
                    <span style={{ color: COLORS.brass }}>Hapkido</span>
                  </StencilHeading>
                  <p
                    className="mt-5 max-w-xl text-sm sm:text-base"
                    style={{ color: COLORS.paperDim }}
                  >
                    Doze faixas. Um único arquivo de missão. Consulte defesas pessoais,
                    socos e chutes organizados por graduação — do recruta faixa branca ao
                    instrutor faixa preta.
                  </p>
                </div>
              </section>

              <section className="max-w-7xl mx-auto px-4 py-10">
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
                        className="text-left relative group p-5 transition-transform duration-150 hover:-translate-y-1"
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
