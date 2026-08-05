import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Users,
  Wallet,
  CalendarCheck,
  Award,
  FileCheck2,
  BarChart3,
  BookOpen,
  Building2,
  DatabaseBackup,
  ShieldCheck,
  ChevronRight,
  PlayCircle,
  LifeBuoy,
} from "lucide-react";
import bannerAsset from "@/assets/hub-banner.jpg";
import { HUB, HUB_SLOGAN, HUB_SUB } from "@/lib/hub-theme";
import { getHubPortalData } from "@/lib/hub.functions";
import { PLANOS } from "@/lib/afc";
import { setSelectedAcademia } from "@/lib/academia-sel";
import {
  HubCard,
  HubShell,
  SectionTitle,
  hubBtnClass,
  hubBtnStyle,
} from "@/components/hub-ui";

export const Route = createFileRoute("/")({
  component: HubPortal,
  head: () => ({
    meta: [
      { title: "Martial Hub — Gestão para academias de artes marciais" },
      {
        name: "description",
        content:
          "Martial Hub: plataforma completa de gestão para academias de artes marciais — alunos, financeiro, presença, graduações e certificados.",
      },
      { property: "og:title", content: "Martial Hub — Uma plataforma. Todas as artes marciais." },
      {
        property: "og:description",
        content:
          "Gerencie sua academia com tecnologia, segurança e praticidade. Tudo em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const RECURSOS = [
  { icon: Users, title: "Gestão completa de alunos", desc: "Cadastros, turmas, professores e graduações." },
  { icon: Wallet, title: "Financeiro", desc: "Mensalidades, planos e controle de pagamentos." },
  { icon: CalendarCheck, title: "Controle de presença", desc: "Chamada rápida por turma e frequência." },
  { icon: Award, title: "Exames e graduações", desc: "Organize exames e promova seus alunos." },
  { icon: FileCheck2, title: "Certificados digitais", desc: "Emissão automática com assinatura." },
  { icon: BarChart3, title: "Estatísticas", desc: "Relatórios e indicadores em tempo real." },
  { icon: BookOpen, title: "Biblioteca de técnicas", desc: "Vídeos e materiais por faixa." },
  { icon: Building2, title: "Multiacademias", desc: "Cada academia com ambiente independente." },
  { icon: DatabaseBackup, title: "Backup automático", desc: "Seus dados sempre preservados." },
  { icon: ShieldCheck, title: "Segurança de dados", desc: "Isolamento total e acesso controlado." },
];

function HubPortal() {
  const fetchPortal = useServerFn(getHubPortalData);
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["hub-portal"], queryFn: () => fetchPortal({}) });
  const stats = data?.stats;
  const academias = data?.academias ?? [];

  const numeros = [
    { label: "Academias cadastradas", value: stats?.academias },
    { label: "Mestres ativos", value: stats?.mestres },
    { label: "Professores", value: stats?.professores },
    { label: "Alunos", value: stats?.alunos },
    { label: "Certificados emitidos", value: stats?.certificados },
    { label: "Técnicas cadastradas", value: stats?.tecnicas },
  ];

  return (
    <HubShell>
      <section className="relative overflow-hidden">
        <img
          src={bannerAsset}
          alt="Rede mundial de academias conectadas pelo Martial Hub"
          width={1920}
          height={960}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(100deg, ${HUB.graphite} 12%, rgba(18,18,18,0.75) 45%, rgba(10,27,61,0.45) 100%)`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-xl animate-fade-in">
            <span
              className="inline-block text-[11px] uppercase tracking-[0.3em] px-3 py-1 rounded-full"
              style={{ color: HUB.gold, border: `1px solid ${HUB.gold}55` }}
            >
              Plataforma SaaS
            </span>
            <h1
              className="mt-5 text-4xl sm:text-5xl font-bold leading-tight"
              style={{ color: HUB.white }}
            >
              O hub completo
              <br />
              das <span style={{ color: HUB.gold }}>artes marciais</span>
            </h1>
            <p className="mt-4 text-base" style={{ color: HUB.text }}>
              {HUB_SLOGAN}
            </p>
            <p className="mt-2 text-sm" style={{ color: HUB.textDim }}>
              {HUB_SUB}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/entrar" className={hubBtnClass} style={hubBtnStyle()}>
                Entrar na Academia <ChevronRight size={16} />
              </Link>
              <Link to="/super" className={hubBtnClass} style={hubBtnStyle("outline")}>
                <ShieldCheck size={16} /> Super Administrador
              </Link>
              <Link to="/criar-academia" className={hubBtnClass} style={hubBtnStyle("outline")}>
                Criar Academia
              </Link>
              <a href="#recursos" className={hubBtnClass} style={hubBtnStyle("ghost")}>
                <PlayCircle size={16} /> Conheça a plataforma
              </a>
              <a href="#planos" className={hubBtnClass} style={hubBtnStyle("ghost")}>
                Planos
              </a>
              <a href="#suporte" className={hubBtnClass} style={hubBtnStyle("ghost")}>
                <LifeBuoy size={16} /> Suporte
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="max-w-7xl mx-auto px-4 py-16 sm:py-20 scroll-mt-20">
        <SectionTitle
          title="Recursos da plataforma"
          subtitle="Tudo que sua academia precisa, em um software profissional"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RECURSOS.map((r) => (
            <HubCard key={r.title}>
              <span
                className="grid h-11 w-11 place-items-center rounded-xl"
                style={{ background: `${HUB.navy}33`, border: `1px solid ${HUB.blue}44` }}
              >
                <r.icon size={20} color={HUB.blue} />
              </span>
              <div className="mt-4 font-semibold" style={{ color: HUB.white }}>
                {r.title}
              </div>
              <p className="mt-1 text-sm" style={{ color: HUB.textDim }}>
                {r.desc}
              </p>
            </HubCard>
          ))}
        </div>
      </section>

      <section className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <HubCard glow className="!p-8">
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 text-center">
              {numeros.map((n) => (
                <div key={n.label}>
                  <div className="text-3xl font-bold" style={{ color: HUB.gold }}>
                    {n.value ?? "—"}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: HUB.textDim }}>
                    {n.label}
                  </div>
                </div>
              ))}
            </div>
          </HubCard>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <SectionTitle title="Escolha sua academia" subtitle="Selecione a academia que deseja acessar" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {academias.map((a) => (
            <HubCard key={a.id} className="text-center">
              <div
                className="mx-auto grid h-20 w-20 place-items-center rounded-full overflow-hidden"
                style={{ background: "#0E1015", border: `1px solid ${HUB.line}` }}
              >
                {a.logo_url ? (
                  <img src={a.logo_url} alt={a.nome} className="h-full w-full object-contain" />
                ) : (
                  <Building2 size={26} color={HUB.gold} />
                )}
              </div>
              <div className="mt-4 font-semibold" style={{ color: HUB.white }}>
                {a.nome}
              </div>
              {a.endereco && (
                <div className="text-xs mt-1" style={{ color: HUB.textDim }}>
                  {a.endereco}
                </div>
              )}
              <div className="text-xs mt-1" style={{ color: HUB.blue }}>
                {a.modalidade}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedAcademia(a.id, a.nome);
                  void navigate({ to: "/academia" });
                }}
                className={`${hubBtnClass} mt-5 w-full`}
                style={hubBtnStyle("outline")}
              >
                Entrar na academia
              </button>
            </HubCard>
          ))}
          {academias.length === 0 && (
            <div className="text-sm col-span-full text-center" style={{ color: HUB.textDim }}>
              Nenhuma academia disponível no momento.
            </div>
          )}
        </div>
      </section>

      <section id="planos" className="max-w-7xl mx-auto px-4 py-16 sm:py-20 scroll-mt-20">
        <SectionTitle title="Planos" subtitle="Escolha o plano ideal para o tamanho da sua academia" />
        <div className="grid gap-5 sm:grid-cols-3">
          {PLANOS.map((p, i) => (
            <HubCard key={p.key} glow={i === 1}>
              <div className="text-xs uppercase tracking-[0.2em]" style={{ color: HUB.gold }}>
                {p.label}
              </div>
              <div className="mt-3 text-3xl font-bold" style={{ color: HUB.white }}>
                R$ {p.preco.toFixed(2).replace(".", ",")}
                <span className="text-sm font-normal" style={{ color: HUB.textDim }}>
                  {" "}
                  /mês
                </span>
              </div>
              <ul className="mt-5 space-y-2 text-sm" style={{ color: HUB.textDim }}>
                {p.recursos.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <ShieldCheck size={15} color={HUB.blue} className="mt-0.5 shrink-0" /> {r}
                  </li>
                ))}
              </ul>
              <a href="#contato" className={`${hubBtnClass} mt-6 w-full`} style={hubBtnStyle(i === 1 ? "primary" : "outline")}>
                Quero este plano
              </a>
            </HubCard>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <HubCard glow className="!p-8 grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold" style={{ color: HUB.gold }}>
              Tenha sua academia no Martial Hub
            </h3>
            <p className="mt-2 text-sm" style={{ color: HUB.textDim }}>
              Crie sua academia agora mesmo e simplifique a gestão do seu negócio.
            </p>
          </div>
          <a href="#contato" className={hubBtnClass} style={hubBtnStyle()}>
            Criar minha academia <ChevronRight size={16} />
          </a>
        </HubCard>
      </section>
    </HubShell>
  );
}
