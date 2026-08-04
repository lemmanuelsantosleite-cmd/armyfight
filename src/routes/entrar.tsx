import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Building2, ChevronLeft } from "lucide-react";
import { HUB } from "@/lib/hub-theme";
import { getHubPortalData } from "@/lib/hub.functions";
import { setSelectedAcademia } from "@/lib/academia-sel";
import { HubCard, HubShell, SectionTitle, hubBtnClass, hubBtnStyle } from "@/components/hub-ui";

export const Route = createFileRoute("/entrar")({
  component: Entrar,
  head: () => ({
    meta: [
      { title: "Entrar — Selecione sua academia | Martial Hub" },
      {
        name: "description",
        content:
          "Selecione a sua academia no Martial Hub e acesse o painel de aluno, professor ou mestre.",
      },
      { property: "og:title", content: "Entrar no Martial Hub" },
      {
        property: "og:description",
        content: "Escolha sua academia e acesse seu painel no Martial Hub.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Entrar() {
  const fetchPortal = useServerFn(getHubPortalData);
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["hub-portal"],
    queryFn: () => fetchPortal({}),
  });
  const academias = data?.academias ?? [];

  return (
    <HubShell>
      <section className="max-w-7xl mx-auto px-4 py-14">
        <Link to="/" className={`${hubBtnClass} mb-8`} style={hubBtnStyle("ghost")}>
          <ChevronLeft size={16} /> Voltar ao Martial Hub
        </Link>
        <SectionTitle
          title="Selecione sua academia"
          subtitle="Cada academia possui seus próprios usuários e ambiente independente"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {academias.map((a) => (
            <HubCard key={a.id}>
              <div className="flex min-w-0 items-center gap-4">
                <span
                  className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl"
                  style={{ background: "#0E1015", border: `1px solid ${HUB.line}` }}
                >
                  {a.logo_url ? (
                    <img src={a.logo_url} alt={a.nome} className="h-full w-full object-contain" />
                  ) : (
                    <Building2 size={24} color={HUB.gold} />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold" style={{ color: HUB.white }}>
                    {a.nome}
                  </div>
                  {a.endereco && (
                    <div className="truncate text-xs" style={{ color: HUB.textDim }}>
                      {a.endereco}
                    </div>
                  )}
                  <div className="mt-1 text-xs" style={{ color: HUB.blue }}>
                    {a.modalidade} ·{" "}
                    <span style={{ color: a.status === "ativa" ? "#4ADE80" : HUB.gold }}>
                      {a.status === "ativa" ? "Ativa" : "Em teste"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedAcademia(a.id, a.nome);
                  void navigate({ to: "/academia" });
                }}
                className={`${hubBtnClass} mt-5 w-full`}
                style={hubBtnStyle()}
              >
                Entrar na academia
              </button>
            </HubCard>
          ))}
          {!isLoading && academias.length === 0 && (
            <div className="col-span-full text-center text-sm" style={{ color: HUB.textDim }}>
              Nenhuma academia cadastrada ainda.
            </div>
          )}
        </div>
      </section>
    </HubShell>
  );
}