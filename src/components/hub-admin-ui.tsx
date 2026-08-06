import type { CSSProperties, ReactNode } from "react";
import { HUB } from "@/lib/hub-theme";

/** Paleta do painel do Super Administrador (identidade Martial Hub). */
export const HCOLORS = {
  ink: HUB.graphite,
  panel: HUB.surface,
  line: HUB.line,
  paper: HUB.text,
  paperDim: HUB.textDim,
  brass: HUB.gold,
  olive: HUB.navy,
};

export const hubInputStyle: CSSProperties = {
  width: "100%",
  background: "#0E1015",
  border: `1px solid ${HUB.line}`,
  borderRadius: 12,
  color: HUB.text,
  padding: "10px 12px",
  fontSize: 14,
  outline: "none",
};

export function HubPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 transition-all duration-300 ${className}`}
      style={{
        background: `linear-gradient(160deg, ${HUB.surface}, ${HUB.surface2})`,
        border: `1px solid ${HUB.line}`,
        boxShadow: "0 16px 40px -30px #000",
      }}
    >
      {children}
    </div>
  );
}

export function HubEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 text-[11px] uppercase tracking-[0.22em]" style={{ color: HUB.gold }}>
      {children}
    </div>
  );
}

export function HubHeading({
  as: Tag = "h3",
  className = "",
  children,
  style,
}: {
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Tag className={`font-bold tracking-tight ${className}`} style={{ color: HUB.white, ...style }}>
      {children}
    </Tag>
  );
}

export function HubField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span
        className="mb-1 block text-[10px] uppercase tracking-[0.2em]"
        style={{ color: HUB.textDim }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

type BtnVariant = "primary" | "brass" | "ghost" | "danger";

export function HubActionButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}: { children: ReactNode; variant?: BtnVariant } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const style: CSSProperties =
    variant === "ghost"
      ? { background: "transparent", color: HUB.textDim, border: `1px solid ${HUB.line}` }
      : variant === "danger"
        ? { background: "rgba(239,68,68,0.14)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.45)" }
        : variant === "brass"
          ? {
              background: `linear-gradient(135deg, ${HUB.gold}, ${HUB.goldSoft})`,
              color: "#171204",
              border: `1px solid ${HUB.gold}`,
            }
          : {
              background: `linear-gradient(135deg, ${HUB.navy}, ${HUB.blue})`,
              color: HUB.white,
              border: `1px solid ${HUB.blue}66`,
            };
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}
