import { Link, useRouterState } from "@tanstack/react-router";
import { Award, CalendarCheck, CreditCard, House, IdCard } from "lucide-react";
import { FloatingMenu, type FloatingMenuItem } from "@/components/ui/floating-menu";
import { Button } from "@/components/ui/button";
import { useAfc } from "@/lib/afc";

export function AfcFloatingMenu() {
  const { isMestre } = useAfc();
  const location = useRouterState({ select: (state) => state.location });
  const search = location.search as { tab?: string };
  const isAcademy = location.pathname === "/academia" || location.pathname.startsWith("/belt/");
  if (!isAcademy && location.pathname !== "/admin" && location.pathname !== "/aluno") return null;

  const items: FloatingMenuItem[] = isMestre ? [
    {
      id: "painel", label: "Painel", icon: <House size={18} />,
      active: location.pathname === "/admin" && (!search.tab || search.tab === "dashboard"),
      renderLink: (children, className) => <Button asChild variant="ghost" className={className}><Link to="/admin" search={{ tab: "dashboard" }} aria-current={location.pathname === "/admin" && (!search.tab || search.tab === "dashboard") ? "page" : undefined}>{children}</Link></Button>,
    },
    {
      id: "faixas", label: "Faixas", icon: <Award size={18} />, active: isAcademy,
      renderLink: (children, className) => <Button asChild variant="ghost" className={className}><Link to="/academia" hash="graduacoes" aria-current={isAcademy ? "page" : undefined}>{children}</Link></Button>,
    },
    {
      id: "presenca", label: "Presença", icon: <CalendarCheck size={18} />,
      active: location.pathname === "/admin" && search.tab === "presencas",
      renderLink: (children, className) => <Button asChild variant="ghost" className={className}><Link to="/admin" search={{ tab: "presencas" }}>{children}</Link></Button>,
    },
    {
      id: "financeiro", label: "Financeiro", icon: <CreditCard size={18} />,
      active: location.pathname === "/admin" && search.tab === "mensalidades",
      renderLink: (children, className) => <Button asChild variant="ghost" className={className}><Link to="/admin" search={{ tab: "mensalidades" }}>{children}</Link></Button>,
    },
  ] : [
    {
      id: "inicio", label: "Início", icon: <House size={18} />,
      active: location.pathname === "/aluno" && (!search.tab || search.tab === "evolucao"),
      renderLink: (children, className) => <Button asChild variant="ghost" className={className}><Link to="/aluno" search={{ tab: "evolucao" }}>{children}</Link></Button>,
    },
    {
      id: "faixas", label: "Faixas", icon: <Award size={18} />,
      active: isAcademy || (location.pathname === "/aluno" && search.tab === "tecnicas"),
      renderLink: (children, className) => <Button asChild variant="ghost" className={className}><Link to="/aluno" search={{ tab: "tecnicas" }}>{children}</Link></Button>,
    },
    {
      id: "presenca", label: "Presença", icon: <CalendarCheck size={18} />,
      active: location.pathname === "/aluno" && search.tab === "frequencia",
      renderLink: (children, className) => <Button asChild variant="ghost" className={className}><Link to="/aluno" search={{ tab: "frequencia" }}>{children}</Link></Button>,
    },
    {
      id: "carteira", label: "Carteirinha", icon: <IdCard size={18} />,
      active: location.pathname === "/aluno" && search.tab === "perfil",
      renderLink: (children, className) => <Button asChild variant="ghost" className={className}><Link to="/aluno" search={{ tab: "perfil" }}>{children}</Link></Button>,
    },
    {
      id: "financeiro", label: "Financeiro", icon: <CreditCard size={18} />,
      active: location.pathname === "/aluno" && search.tab === "mensalidade",
      renderLink: (children, className) => <Button asChild variant="ghost" className={className}><Link to="/aluno" search={{ tab: "mensalidade" }}>{children}</Link></Button>,
    },
  ];
  return <FloatingMenu items={items} />;
}