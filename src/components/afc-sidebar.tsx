import { Link, useRouterState } from "@tanstack/react-router";
import { X, ArrowLeft } from "lucide-react";
import { BELTS, COLORS } from "@/lib/afc";
import { BeltSwatch, StencilHeading } from "@/components/afc-ui";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 lg:top-0 left-0 h-screen lg:h-[calc(100vh-0px)] w-72 z-50 lg:z-10 transform transition-transform duration-200 overflow-y-auto
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ background: COLORS.panel, borderRight: `1px solid ${COLORS.line}` }}
      >
        <div className="p-4 flex items-center justify-between lg:hidden">
          <StencilHeading as="div" className="text-sm font-bold" style={{ color: COLORS.brass }}>
            Faixas
          </StencilHeading>
          <button onClick={onClose} style={{ color: COLORS.paper }} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <Link
          to="/"
          onClick={onClose}
          className="w-full text-left px-4 py-3 flex items-center gap-2 text-sm uppercase tracking-wide hover:brightness-125"
          style={{
            color: COLORS.paper,
            borderBottom: `1px solid ${COLORS.line}`,
            fontFamily: "'Oswald', sans-serif",
          }}
        >
          <ArrowLeft size={15} color={COLORS.brass} /> Base / Início
        </Link>
        <nav className="py-2">
          {BELTS.map((belt) => {
            const active = pathname === `/belt/${belt.id}`;
            return (
              <Link
                key={belt.id}
                to="/belt/$beltId"
                params={{ beltId: belt.id }}
                onClick={onClose}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:brightness-125 transition"
                style={{
                  background: active ? COLORS.oliveDim : "transparent",
                  borderLeft: active
                    ? `3px solid ${COLORS.brass}`
                    : "3px solid transparent",
                }}
              >
                <span
                  className="text-xs w-5 shrink-0"
                  style={{ color: COLORS.paperDim, fontFamily: "'Oswald', sans-serif" }}
                >
                  {String(belt.n).padStart(2, "0")}
                </span>
                <BeltSwatch belt={belt} size="sm" />
                <span className="text-xs leading-tight" style={{ color: COLORS.paper }}>
                  {belt.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}