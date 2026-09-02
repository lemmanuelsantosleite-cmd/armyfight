import { createFileRoute, redirect } from "@tanstack/react-router";

/** Modo academia única: cadastro de novas academias desativado temporariamente. */
export const Route = createFileRoute("/criar-academia")({
  beforeLoad: () => {
    throw redirect({ to: "/academia" });
  },
  component: () => null,
  head: () => ({
    meta: [
      { title: "Army Fight Club Hapkido — Sistema da academia" },
      {
        name: "description",
        content:
          "O sistema opera atualmente apenas para a Army Fight Club Hapkido. O cadastro de novas academias está desativado.",
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
