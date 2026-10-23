import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AfcProvider, useAfc } from "@/lib/afc";
import { AuthScreen, StatusScreen } from "@/components/afc-auth";
import { ComunicadoBanner, SuporteButton } from "@/components/afc-suporte";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Martial Hub — Gestão para academias de artes marciais" },
      {
        name: "description",
        content:
          "Martial Hub: plataforma de gestão para academias de artes marciais — alunos, financeiro, presença, graduações e certificados.",
      },
      { name: "author", content: "Martial Hub" },
      { property: "og:title", content: "Martial Hub" },
      {
        property: "og:description",
        content: "Uma plataforma. Todas as artes marciais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AfcProvider>
        <AuthGate />
      </AfcProvider>
    </QueryClientProvider>
  );
}

function AuthGate() {
  const { hydrated, user, profile, isMestre, isSuper } = useAfc();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPortal =
    pathname === "/" ||
    pathname === "/entrar" ||
    pathname === "/super" ||
    pathname === "/criar-academia";

  if (isPortal) return <Outlet />;
  if (!hydrated) return null;
  if (!user) return <AuthScreen />;
  if (!isMestre && !isSuper) {
    if (!profile) return <StatusScreen variant="pendente" />;
    if (profile.status === "pendente") return <StatusScreen variant="pendente" />;
    if (profile.status === "bloqueado") return <StatusScreen variant="bloqueado" />;
    if (profile.bloqueado_inadimplencia) return <StatusScreen variant="inadimplente" />;
  }
  return (
    <>
      <ComunicadoBanner />
      <Outlet />
      <SuporteButton />
      <div
        style={{
          position: "fixed",
          bottom: 6,
          right: 10,
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(168,164,143,0.55)",
          fontFamily: "'Oswald', sans-serif",
          pointerEvents: "none",
          zIndex: 30,
        }}
      >
        Feito por Lucas
      </div>
    </>
  );
}
