import { createFileRoute, redirect } from "@tanstack/react-router";

/** Modo academia única: seleção de academias desativada temporariamente. */
export const Route = createFileRoute("/entrar")({
  beforeLoad: () => {
    throw redirect({ to: "/academia" });
  },
  component: () => null,
  head: () => ({
    meta: [
      { title: "Entrar — Army Fight Club Hapkido" },
      {
        name: "description",
        content: "Acesse o sistema da Army Fight Club Hapkido com seu nome completo e senha.",
      },
      { property: "og:title", content: "Entrar — Army Fight Club Hapkido" },
      {
        property: "og:description",
        content: "Área de acesso dos alunos, professores e mestre da Army Fight Club Hapkido.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
