import { Link } from "@tanstack/react-router";
import { Menu, Search, ShieldCheck, User, LogOut, Settings, ClipboardList } from "lucide-react";
import { COLORS, camoStyle, useAfc } from "@/lib/afc";
import { Button } from "@/components/afc-ui";

export function Header({
  onMenu,
  onSettingsClick,
  search,
  setSearch,
}: {
  onMenu: () => void;
  onSettingsClick?: () => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  const { isMestre, isSuper, profile, signOut, academia } = useAfc();
  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: "rgba(10,11,7,0.95)",
        borderColor: COLORS.line,
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="h-1" style={camoStyle(1)} />
      <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
        <button
          className="lg:hidden shrink-0"
          onClick={onMenu}
          style={{ color: COLORS.paper }}
          aria-label="Menu"
        >
          <Menu size={22} />
        </button>

        <Link to="/academia" className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-sm shrink-0"
            style={{ background: COLORS.olive, border: `1px solid ${COLORS.oliveBright}` }}
          >
            <ShieldCheck size={20} color="#f2f0e6" />
          </div>
          <div className="text-left leading-none min-w-0">
            <div
              className="text-sm sm:text-lg font-bold uppercase truncate"
              style={{
                fontFamily: "'Oswald', sans-serif",
                color: COLORS.paper,
                letterSpacing: "0.08em",
              }}
            >
              {academia?.nome ?? "Army Fight Club"}
            </div>
            <div
              className="text-[10px] sm:text-xs uppercase"
              style={{ color: COLORS.brass, letterSpacing: "0.4em" }}
            >
              {academia?.modalidade ?? "Hapkido"}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 justify-end">
          {profile && (
            <div
              className="hidden sm:flex items-center gap-2 text-sm px-2 py-1 rounded-sm"
              style={{ border: `1px solid ${COLORS.line}` }}
            >
              <User size={14} color={COLORS.brass} />
              <span
                className="uppercase tracking-wide truncate max-w-[160px]"
                style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
              >
                {isMestre ? `Mestre ${profile.nome}` : profile.nome}
              </span>
            </div>
          )}
          {isMestre && (
            <Link
              to="/admin"
              title="Painel do Mestre"
              className="hover:brightness-125 p-1"
            >
              <ClipboardList size={18} color={COLORS.brass} />
            </Link>
          )}
          {!isMestre && profile && (
            <Link to="/aluno" title="Meu painel" className="hover:brightness-125 p-1">
              <ClipboardList size={18} color={COLORS.brass} />
            </Link>
          )}
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              title="Configurações"
              className="hover:brightness-125 p-1"
            >
              <Settings size={18} color={COLORS.paperDim} />
            </button>
          )}
          <Button variant="ghost" onClick={() => void signOut()} title="Sair">
            <LogOut size={14} /> <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-3 md:pb-3">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-sm"
          style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
        >
          <Search size={16} color={COLORS.paperDim} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar técnica..."
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: COLORS.paper }}
          />
        </div>
      </div>
    </header>
  );
}