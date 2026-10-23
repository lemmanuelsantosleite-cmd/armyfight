import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  BELTS,
  CATEGORIES,
  COLORS,
  camoStyle,
  findBelt,
  useAfc,
  type CategoryKey,
} from "@/lib/afc";
import { Header } from "@/components/afc-header";
import { Sidebar } from "@/components/afc-sidebar";
import { AdminSettingsModal } from "@/components/afc-modals";
import { Lock } from "lucide-react";
import { BeltSwatch, Eyebrow, StencilHeading } from "@/components/afc-ui";
import { AddTechniqueButton, TechniqueCard } from "@/components/afc-technique";

export const Route = createFileRoute("/belt/$beltId")({
  head: ({ params }) => {
    const belt = BELTS.find((b) => b.id === params.beltId);
    const title = belt
      ? `${belt.name} — Army Fight Club Hapkido`
      : "Faixa — Army Fight Club Hapkido";
    const desc = belt
      ? `Técnicas de ${belt.name}: defesas pessoais, socos e chutes.`
      : "Biblioteca de técnicas do Army Fight Club Hapkido.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: BeltPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.ink, color: COLORS.paper }}>
      Faixa não encontrada.
    </div>
  ),
});

function BeltPage() {
  const { beltId } = Route.useParams();
  const belt = findBelt(beltId);
  if (!belt) throw notFound();

  const { data, isMestre, canAccessBelt } = useAfc();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<CategoryKey>("defesas");
  const locked = !canAccessBelt(belt.id);

  const beltData = data[belt.id] ?? { defesas: [], socos: [], chutes: [] };
  const list = useMemo(() => {
    const arr = beltData[activeCat] ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    );
  }, [beltData, activeCat, search]);

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
          <section
            className="relative border-b"
            style={{ borderColor: COLORS.line }}
          >
            <div className="absolute inset-0" style={camoStyle(0.4)} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,11,7,0.55) 0%, rgba(10,11,7,0.95) 100%)",
              }}
            />
            <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-10">
              <Link
                to="/academia"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest hover:brightness-125"
                style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
              >
                <ArrowLeft size={13} /> Voltar
              </Link>
              <div className="mt-3 flex items-center gap-4">
                <span
                  className="text-4xl sm:text-5xl font-bold"
                  style={{
                    color: COLORS.oliveBright,
                    fontFamily: "'Oswald', sans-serif",
                  }}
                >
                  {String(belt.n).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <Eyebrow>Graduação</Eyebrow>
                  <StencilHeading as="h1" className="text-2xl sm:text-4xl truncate">
                    {belt.name}
                  </StencilHeading>
                </div>
              </div>
              <div className="mt-4">
                <BeltSwatch belt={belt} size="lg" />
              </div>
            </div>
          </section>

          {locked ? (
            <section className="max-w-5xl mx-auto px-4 py-16 text-center">
              <Lock size={40} color={COLORS.brass} className="mx-auto mb-4" />
              <StencilHeading as="h2" className="text-xl mb-2" style={{ color: COLORS.brass }}>
                Faixa bloqueada
              </StencilHeading>
              <p className="text-sm" style={{ color: COLORS.paperDim }}>
                O conteúdo desta faixa fica disponível após você atingir esta graduação.
              </p>
            </section>
          ) : (
          <section className="max-w-5xl mx-auto px-4 py-6">
            <div
              className="flex flex-wrap gap-1 p-1 mb-6 rounded-sm"
              style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
            >
              {CATEGORIES.map((c) => {
                const active = activeCat === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => setActiveCat(c.key)}
                    className="flex-1 min-w-[120px] px-3 py-2 text-xs sm:text-sm uppercase tracking-wider transition"
                    style={{
                      background: active ? COLORS.olive : "transparent",
                      color: active ? "#f2f0e6" : COLORS.paperDim,
                      fontFamily: "'Oswald', sans-serif",
                      border: active ? `1px solid ${COLORS.oliveBright}` : "1px solid transparent",
                    }}
                  >
                    <span className="mr-1">{c.icon}</span> {c.label}
                  </button>
                );
              })}
            </div>

            {isMestre && (
              <div className="mb-5">
                <AddTechniqueButton beltId={belt.id} category={activeCat} />
              </div>
            )}

            <div className="space-y-3">
              {list.length === 0 ? (
                <div
                  className="p-6 text-sm text-center"
                  style={{
                    color: COLORS.paperDim,
                    background: COLORS.panel,
                    border: `1px dashed ${COLORS.line}`,
                  }}
                >
                  Nenhuma técnica cadastrada nesta categoria.
                </div>
              ) : (
                list.map((t, i) => (
                  <TechniqueCard
                    key={t.id}
                    technique={t}
                    beltId={belt.id}
                    category={activeCat}
                    isFirst={i === 0}
                    isLast={i === list.length - 1}
                  />
                ))
              )}
            </div>
          </section>
          )}
        </main>
      </div>
      {settingsOpen && <AdminSettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}