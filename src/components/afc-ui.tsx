import type { ReactNode, CSSProperties } from "react";
import { COLORS, type Belt } from "@/lib/afc";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      className="text-xs uppercase font-semibold mb-2"
      style={{
        color: COLORS.brass,
        fontFamily: "'Oswald', sans-serif",
        letterSpacing: "0.35em",
      }}
    >
      {children}
    </div>
  );
}

export function StencilHeading({
  as: Tag = "h1",
  className = "",
  children,
  style,
}: {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const Comp = Tag as React.ElementType;
  return (
    <Comp
      className={`uppercase tracking-wide ${className}`}
      style={{ fontFamily: "'Oswald', sans-serif", color: COLORS.paper, ...style }}
    >
      {children}
    </Comp>
  );
}

export function Divider() {
  return (
    <div
      className="w-full h-px my-6"
      style={{
        background: `repeating-linear-gradient(90deg, ${COLORS.olive} 0 10px, transparent 10px 16px)`,
      }}
    />
  );
}

export function BeltSwatch({ belt, size = "md" }: { belt: Belt; size?: "sm" | "md" | "lg" }) {
  const h = size === "sm" ? 10 : size === "lg" ? 18 : 14;
  const [c1, c2] = belt.grad;
  return (
    <div
      className="rounded-sm relative shrink-0"
      style={{
        height: h,
        width: h * 3.6,
        background: c1 === c2 ? c1 : `linear-gradient(90deg, ${c1} 60%, ${c2} 100%)`,
        border: `1px solid ${COLORS.line}`,
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.35)",
      }}
    >
      {belt.dan && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ gap: 3 }}>
          {Array.from({ length: belt.dan }).map((_, i) => (
            <span
              key={i}
              style={{ background: COLORS.brass, width: 2, height: h * 0.7 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type BtnVariant = "solid" | "brass" | "ghost" | "danger";

export function Button({
  children,
  onClick,
  variant = "solid",
  className = "",
  type = "button",
  title,
  disabled,
}: {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: BtnVariant;
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-all duration-150 disabled:opacity-50";
  const styles: Record<BtnVariant, CSSProperties> = {
    solid: { background: COLORS.olive, color: "#f2f0e6", border: `1px solid ${COLORS.oliveBright}` },
    brass: { background: COLORS.brass, color: "#14150f", border: `1px solid ${COLORS.brassBright}` },
    ghost: { background: "transparent", color: COLORS.paper, border: `1px solid ${COLORS.line}` },
    danger: { background: "transparent", color: "#e08070", border: `1px solid #6b2018` },
  };
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${className} hover:brightness-125 active:scale-95`}
      style={{ ...styles[variant], fontFamily: "'Oswald', sans-serif" }}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span
        className="text-xs uppercase tracking-widest"
        style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputStyle: CSSProperties = {
  background: COLORS.ink,
  color: COLORS.paper,
  border: `1px solid ${COLORS.line}`,
  padding: "8px 10px",
  width: "100%",
  outline: "none",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  borderRadius: 2,
};