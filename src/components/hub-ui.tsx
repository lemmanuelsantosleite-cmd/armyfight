import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Shield } from "lucide-react";
import { HUB } from "@/lib/hub-theme";

export function HubShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: HUB.graphite, color: HUB.text, minHeight: "100vh" }}>
      <HubNav />
      {children}
      <HubFooter />
    </div>
  );
}

export function HubLogo({ size = 40 }: { size?: number }) {
  return (
    <span className="flex items-center gap-3 min-w-0">
      <span
        className="grid place-items-center shrink-0 rounded-xl"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(145deg, ${HUB.navy}, ${HUB.navyDeep})`,
          border: `1px solid ${HUB.gold}55`,
          boxShadow: `0 8px 24px ${HUB.navy}55`,
        }}
      >
        <Shield size={size * 0.5} color={HUB.gold} />
      </span>
      <span className="leading-tight min-w-0">
        <span
          className="block text-base sm:text-lg font-bold tracking-[0.18em] uppercase truncate"
          style={{ color: HUB.white }}
        >
          Martial Hub
        </span>
        <span
          className="block text-[9px] uppercase tracking-[0.22em] truncate"
          style={{ color: HUB.textDim }}
        >
          Plataforma de gestão de academias
        </span>
      </span>
    </span>
  );
}

export function HubButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}: {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={`${hubBtnClass} ${className}`} style={hubBtnStyle(variant)}>
      {children}
    </button>
  );
}

export const hubBtnClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold tracking-wide transition-all duration-200 hover:-translate-y-0.5";

export function hubBtnStyle(variant: "primary" | "outline" | "ghost" = "primary") {
  if (variant === "primary")
    return {
      background: `linear-gradient(135deg, ${HUB.gold}, ${HUB.goldSoft})`,
      color: "#171204",
      border: `1px solid ${HUB.gold}`,
      boxShadow: `0 12px 30px -12px ${HUB.gold}99`,
    } as const;
  if (variant === "outline")
    return {
      background: "transparent",
      color: HUB.white,
      border: `1px solid ${HUB.gold}`,
    } as const;
  return { background: "transparent", color: HUB.textDim, border: `1px solid ${HUB.line}` } as const;
}

export function HubCard({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${className}`}
      style={{
        background: `linear-gradient(160deg, ${HUB.surface}, ${HUB.surface2})`,
        border: `1px solid ${HUB.line}`,
        boxShadow: glow ? `0 20px 50px -25px ${HUB.blue}` : "0 16px 40px -30px #000",
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: HUB.white }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm" style={{ color: HUB.textDim }}>
          {subtitle}
        </p>
      )}
      <div
        className="mx-auto mt-4 h-[2px] w-16 rounded-full"
        style={{ background: `linear-gradient(90deg, ${HUB.blue}, ${HUB.gold})` }}
      />
    </div>
  );
}

function HubNav() {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur"
      style={{ background: "rgba(18,18,18,0.85)", borderBottom: `1px solid ${HUB.line}` }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <Link to="/" className="min-w-0">
          <HubLogo />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <a
            href="#recursos"
            className="hidden md:inline text-sm px-3 py-2 rounded-lg hover:opacity-80"
            style={{ color: HUB.textDim }}
          >
            Recursos
          </a>
          <a
            href="#planos"
            className="hidden md:inline text-sm px-3 py-2 rounded-lg hover:opacity-80"
            style={{ color: HUB.textDim }}
          >
            Planos
          </a>
          <a
            href="#contato"
            className="hidden md:inline text-sm px-3 py-2 rounded-lg hover:opacity-80"
            style={{ color: HUB.textDim }}
          >
            Contato
          </a>
          <Link to="/entrar" className={hubBtnClass} style={hubBtnStyle("outline")}>
            Entrar
          </Link>
          <a href="#contato" className={`${hubBtnClass} hidden sm:inline-flex`} style={hubBtnStyle()}>
            Criar Academia
          </a>
        </nav>
      </div>
    </header>
  );
}

function HubFooter() {
  return (
    <footer id="contato" style={{ borderTop: `1px solid ${HUB.line}`, background: "#0E1015" }}>
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <HubLogo />
          <p className="mt-4 text-sm" style={{ color: HUB.textDim }}>
            A plataforma completa para academias de artes marciais.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: HUB.gold }}>
            Plataforma
          </div>
          <ul className="space-y-2 text-sm" style={{ color: HUB.textDim }}>
            <li>Recursos</li>
            <li>Planos</li>
            <li>Segurança</li>
            <li>Atualizações</li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: HUB.gold }}>
            Suporte
          </div>
          <ul className="space-y-2 text-sm" style={{ color: HUB.textDim }}>
            <li>Central de ajuda</li>
            <li>Vídeos tutoriais</li>
            <li>Fale conosco</li>
            <li>Status do sistema</li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: HUB.gold }}>
            Contato
          </div>
          <ul className="space-y-2 text-sm" style={{ color: HUB.textDim }}>
            <li>contato@martialhub.com.br</li>
            <li>24h por dia / 7 dias por semana</li>
          </ul>
        </div>
      </div>
      <div
        className="px-4 py-4 text-center text-xs"
        style={{ borderTop: `1px solid ${HUB.line}`, color: HUB.textDim }}
      >
        © {new Date().getFullYear()} Martial Hub — Todos os direitos reservados. · Feito por Lucas
      </div>
    </footer>
  );
}