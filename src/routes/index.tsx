import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Modo academia única: a página inicial abre direto o sistema da
 * Army Fight Club Hapkido. O portal multiacademias segue existindo no código,
 * mas não é exposto nesta fase.
 */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/academia" });
  },
  component: () => null,
  head: () => ({
    meta: [
      { title: "Army Fight Club Hapkido — Sistema de gestão da academia" },
      {
        name: "description",
        content:
          "Sistema oficial da Army Fight Club Hapkido: técnicas por faixa, presença, mensalidades, exames, certificados e painéis de mestre, professor e aluno.",
      },
      { property: "og:title", content: "Army Fight Club Hapkido" },
      {
        property: "og:description",
        content: "Sistema completo de gestão da Army Fight Club Hapkido.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
