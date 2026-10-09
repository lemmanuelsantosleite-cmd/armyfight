# MARTIAL HUB

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



function Button({ children, onClick, variant = "solid", className = "", type = "button", title }) {

  const base =

    "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-all duration-150";

  const styles = {

    solid: { background: COLORS.olive, color: "#f2f0e6", border: `1px solid ${COLORS.oliveBright}` },

    brass: { background: COLORS.brass, color: "#14150f", border: `1px solid ${COLORS.brassBright}` },

    ghost: { background: "transparent", color: COLORS.paper, border: `1px solid ${COLORS.line}` },

    danger: { background: "transparent", color: "#e08070", border: `1px solid #6b2018` },

  };

  return (

    <button

      type={type}

      title={title}

      onClick={onClick}

      className={`${base} ${className} hover:brightness-125 active:scale-95`}

      style={{ ...styles[variant], fontFamily: "'Oswald', sans-serif" }}

    >

      {children}

    </button>

  );

}



/* ------------------------------ Header ------------------------------ */



function Header({ onMenu, isAdmin, adminName, onLoginClick, onLogout, onSettingsClick, onAdminPanelClick, adminPanelDirty, search, setSearch, onSearchSubmit, onLogoClick }) {

  return (

    <header

      className="sticky top-0 z-40 border-b"

      style={{ background: "rgba(10,11,7,0.95)", borderColor: COLORS.line, backdropFilter: "blur(6px)" }}

    >

      <div className="h-1" style={useCamoLayer(1)} />

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">

        <button className="lg:hidden text-paper" onClick={onMenu} style={{ color: COLORS.paper }}>

          <Menu size={24} />

        </button>



        <button onClick={onLogoClick} className="flex items-center gap-3 group">

          <div

            className="w-10 h-10 flex items-center justify-center rounded-sm shrink-0"

            style={{ background: COLORS.olive, border: `1px solid ${COLORS.oliveBright}` }}

          >

            <ShieldCheck size={22} color="#f2f0e6" />

          </div>

          <div className="text-left leading-none hidden sm:block">

            <div

              className="text-lg sm:text-xl font-bold tracking-widest uppercase group-hover:text-brass"

              style={{ fontFamily: "'Oswald', sans-serif", color: COLORS.paper, letterSpacing: "0.08em" }}

            >

              Army Fight Club

            </div>

            <div className="text-xs uppercase" style={{ color: COLORS.brass, letterSpacing: "0.4em" }}>

              Hapkido

            </div>

          </div>

        </button>



        <form

          onSubmit={(e) => {

            e.preventDefault();

            onSearchSubmit();

          }}

          className="flex-1 max-w-md ml-2 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-sm"

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

        </form>



        <div className="ml-auto flex items-center gap-3">

          {isAdmin ? (

            <>

              <div className="hidden sm:flex items-center gap-2 text-sm">

                <User size={16} color={COLORS.brass} />

                <span style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }} className="uppercase tracking-wide">

                  {adminName}

                </span>

              </div>

              <button onClick={onAdminPanelClick} title="Painel do Administrador" className="relative hover:brightness-125">

                <ClipboardList size={18} color={COLORS.paperDim} />

                {adminPanelDirty && (

                  <span

                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full"

                    style={{ background: COLORS.brass, border: `1px solid ${COLORS.ink}` }}

                  />

                )}

              </button>

              <button onClick={onSettingsClick} title="Configurações do administrador" className="hover:brightness-125">

                <Settings size={18} color={COLORS.paperDim} />

              </button>

              <Button variant="ghost" onClick={onLogout} title="Sair do painel administrativo">

                <LogOut size={15} /> <span className="hidden sm:inline">Sair</span>

              </Button>

            </>

          ) : (

            <Button variant="brass" onClick={onLoginClick}>

              <Lock size={15} /> <span className="hidden sm:inline">Admin</span>

            </Button>

          )}

        </div>

      </div>

      <form

        onSubmit={(e) => {

          e.preventDefault();

          onSearchSubmit();

        }}

        className="md:hidden px-4 pb-3 flex items-center gap-2"

      >

        <div

          className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-sm"

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

      </form>

    </header>

  );

}



/* ------------------------------ Sidebar ------------------------------ */



function Sidebar({ open, onClose, activeBeltId, onSelectBelt, onHome }) {

  return (

    <>

      {open && (

        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose} />

      )}

      <aside

        className={`fixed lg:sticky top-0 lg:top-[65px] left-0 h-screen lg:h-[calc(100vh-65px)] w-72 z-50 lg:z-10 transform transition-transform duration-200 overflow-y-auto

        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}

        style={{ background: COLORS.panel, borderRight: `1px solid ${COLORS.line}` }}

      >

        <div className="p-4 flex items-center justify-between lg:hidden">

          <StencilHeading as="div" className="text-sm font-bold" style={{ color: COLORS.brass }}>

            Faixas

          </StencilHeading>

          <button onClick={onClose} style={{ color: COLORS.paper }}>

            <X size={20} />

          </button>

        </div>

        <button

          onClick={onHome}

          className="w-full text-left px-4 py-3 flex items-center gap-2 text-sm uppercase tracking-wide hover:brightness-125"

          style={{ color: COLORS.paper, borderBottom: `1px solid ${COLORS.line}`, fontFamily: "'Oswald', sans-serif" }}

        >

          <ArrowLeft size={15} color={COLORS.brass} /> Base / Início

        </button>

        <nav className="py-2">

          {BELTS.map((belt) => (

            <button

              key={belt.id}

              onClick={() => onSelectBelt(belt.id)}

              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:brightness-125 transition"

              style={{

                background: activeBeltId === belt.id ? COLORS.oliveDim : "transparent",

                borderLeft: activeBeltId === belt.id ? `3px solid ${COLORS.brass}` : "3px solid transparent",

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

            </button>

          ))}

        </nav>

      </aside>

    </>

  );

}



/* ------------------------------ Home ------------------------------ */



function Home({ onSelectBelt, techniques }) {

  return (

    <div>

      <section

        className="relative overflow-hidden border-b"

        style={{ borderColor: COLORS.line }}

      >

        <div className="absolute inset-0" style={useCamoLayer(0.5)} />

        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,11,7,0.4) 0%, rgba(10,11,7,0.96) 100%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">

          <Eyebrow>Biblioteca digital de técnicas</Eyebrow>

          <StencilHeading className="text-4xl sm:text-6xl font-bold" style={{ lineHeight: 0.95 }}>

            Army Fight Club

            <br />

            <span style={{ color: COLORS.brass }}>Hapkido</span>

          </StencilHeading>

          <p className="mt-5 max-w-xl text-sm sm:text-base" style={{ color: COLORS.paperDim }}>

            Doze faixas. Um único arquivo de missão. Consulte defesas pessoais, socos e chutes

            organizados por graduação — do recruta faixa branca ao instrutor faixa preta.

          </p>

        </div>

      </section>



      <section className="max-w-7xl mx-auto px-4 py-10">

        <div className="flex items-baseline justify-between mb-6">

          <StencilHeading as="h2" className="text-xl font-bold">

            Graduações

          </StencilHeading>

          <span className="text-xs" style={{ color: COLORS.paperDim, fontFamily: "'Oswald', sans-serif" }}>

            12 faixas cadastradas

          </span>

        </div>



        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {BELTS.map((belt) => {

            const count = CATEGORIES.reduce(

              (sum, c) => sum + (techniques[belt.id]?.[c.key]?.length || 0),

              0

            );

            return (

              <button

                key={belt.id}

                onClick={() => onSelectBelt(belt.id)}

                className="text-left relative group p-5 transition-transform duration-150 hover:-translate-y-1"

                style={{

                  background: COLORS.panel,

                  border: `1px solid ${COLORS.line}`,

                  clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",

                }}

              >

                <div

                  className="absolute top-3 right-3 w-2 h-2 rounded-full"

                  style={{ background: COLORS.oliveDim, border: `1px solid ${COLORS.steelLight}` }}

                />

                <div className="flex items-center justify-between mb-3">

                  <span

                    className="text-3xl font-bold"

                    style={{ color: COLORS.oliveBright, fontFamily: "'Oswald', sans-serif" }}

                  >

                    {String(belt.n).padStart(2, "0")}

                  </span>

                  <ChevronRight size={18} color={COLORS.brass} className="group-hover:translate-x-1 transition-transform" />

                </div>

                <BeltSwatch belt={belt} size="lg" />

                <div

                  className="mt-3 text-base font-semibold uppercase tracking-wide"

                  style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}

                >

                  {belt.name}

                </div>

                <div className="mt-1 text-xs" style={{ color: COLORS.paperDim }}>

                  {count} técnica{count === 1 ? "" : "s"} cadastrada{count === 1 ? "" : "s"}

                </div>

              </button>

            );

          })}

        </div>

      </section>

    </div>

  );

}



/* ------------------------------ Technique Card ------------------------------ */



function isVideoEmbed(url) {

  return /youtube\.com|youtu\.be|vimeo\.com/.test(url || "");

}

function toEmbed(url) {

  if (!url) return "";

  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);

  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  const vm = url.match(/vimeo\.com\/(\d+)/);

  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;

  return url;

}



function TechniqueCard({ technique }) {

  const [expanded, setExpanded] = useState(false);

  return (

    <div

      className="relative"

      style={{ background: COLORS.panel2, border: `1px solid ${COLORS.line}` }}

    >

      <div className="p-4 flex items-start gap-3">

        <div className="flex-1 min-w-0">

          <button

            onClick={() => setExpanded((v) => !v)}

            className="text-left w-full"

          >

            <div

              className="font-semibold uppercase tracking-wide text-sm sm:text-base"

              style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}

            >

              {technique.title}

            </div>

            <p className="text-xs sm:text-sm mt-1 line-clamp-2" style={{ color: COLORS.paperDim }}>

              {technique.description}

            </p>

          </button>



          {expanded && (

            <div className="mt-3 space-y-3">

              {technique.description && (

                <p className="text-sm" style={{ color: COLORS.paper }}>

                  {technique.description}

                </p>

              )}

              {technique.image && (

                <img

                  src={technique.image}

                  alt={technique.title}

                  className="w-full max-h-72 object-cover rounded-sm"

                  style={{ border: `1px solid ${COLORS.line}` }}

                />

              )}

              {technique.video && (

                <div className="aspect-video w-full rounded-sm overflow-hidden" style={{ border: `1px solid ${COLORS.line}` }}>

                  {isVideoEmbed(technique.video) ? (

                    <iframe

                      src={toEmbed(technique.video)}

                      className="w-full h-full"

                      title={technique.title}

                      allowFullScreen

                    />

                  ) : (

                    <video src={technique.video} controls className="w-full h-full" />

                  )}

                </div>

              )}

              {!technique.image && !technique.video && (

                <div className="text-xs italic" style={{ color: COLORS.paperDim }}>

                  Nenhuma mídia cadastrada para esta técnica ainda.

                </div>

              )}

            </div>

          )}

        </div>



        <div className="flex gap-1 text-xs shrink-0" style={{ color: COLORS.paperDim }}>

          {technique.video && <Video size={13} color={COLORS.oliveBright} />}

          {technique.image && <ImageIcon size={13} color={COLORS.oliveBright} />}

        </div>

      </div>

    </div>

  );

}



/* ------------------------------ Technique Editor Modal ------------------------------ */



function TechniqueModal({ initial, onSave, onClose }) {

  const [title, setTitle] = useState(initial?.title || "");

  const [description, setDescription] = useState(initial?.description || "");

  const [video, setVideo] = useState(initial?.video || "");

  const [image, setImage] = useState(initial?.image || "");



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>

      <div

        className="w-full max-w-lg p-6 overflow-y-auto"

        style={{ background: COLORS.panel, border: `1px solid ${COLORS.olive}`, maxHeight: "90vh" }}

      >

        <div className="flex items-center justify-between mb-4">

          <StencilHeading as="h3" className="text-lg font-bold">

            {initial ? "Editar técnica" : "Nova técnica"}

          </StencilHeading>

          <button onClick={onClose}>

            <X size={20} color={COLORS.paperDim} />

          </button>

        </div>



        <div className="space-y-3">

          <div>

            <label className="text-xs uppercase tracking-wide" style={{ color: COLORS.brass }}>Título</label>

            <input

              value={title}

              onChange={(e) => setTitle(e.target.value)}

              className="w-full mt-1 px-3 py-2 text-sm outline-none"

              style={{ background: COLORS.ink, color: COLORS.paper, border: `1px solid ${COLORS.line}` }}

              placeholder="Ex: Chave de pulso frontal"

            />

          </div>

          <div>

            <label className="text-xs uppercase tracking-wide" style={{ color: COLORS.brass }}>Explicação</label>

            <textarea

              value={description}

              onChange={(e) => setDescription(e.target.value)}

              rows={4}

              className="w-full mt-1 px-3 py-2 text-sm outline-none"

              style={{ background: COLORS.ink, color: COLORS.paper, border: `1px solid ${COLORS.line}` }}

              placeholder="Descreva a técnica passo a passo..."

            />

          </div>

          <div>

            <label className="text-xs uppercase tracking-wide" style={{ color: COLORS.brass }}>URL do vídeo (YouTube, Vimeo ou link direto)</label>

            <input

              value={video}

              onChange={(e) => setVideo(e.target.value)}

              className="w-full mt-1 px-3 py-2 text-sm outline-none"

              style={{ background: COLORS.ink, color: COLORS.paper, border: `1px solid ${COLORS.line}` }}

              placeholder="https://youtube.com/watch?v=..."

            />

          </div>

          <div>

            <label className="text-xs uppercase tracking-wide" style={{ color: COLORS.brass }}>URL da imagem</label>

            <input

              value={image}

              onChange={(e) => setImage(e.target.value)}

              className="w-full mt-1 px-3 py-2 text-sm outline-none"

              style={{ background: COLORS.ink, color: COLORS.paper, border: `1px solid ${COLORS.line}` }}

              placeholder="https://..."

            />

          </div>

        </div>



        <div className="flex justify-end gap-2 mt-5">

          <Button variant="ghost" onClick={onClose}>Cancelar</Button>

          <Button

            variant="brass"

            onClick={() => {

              if (!title.trim()) return;

              onSave({ title: title.trim(), description, video, image });

            }}

          >

            <Save size={15} /> Salvar

          </Button>

        </div>

      </div>

    </div>

  );

}



/* ------------------------------ Login Modal ------------------------------ */



function LoginModal({ adminCredential, onClose, onLogin }) {

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>

      <form

        onSubmit={(e) => {

          e.preventDefault();

          if (password !== adminCredential.password) {

            setError("Senha incorreta.");

            return;

          }

          onLogin();

        }}

        className="w-full max-w-sm p-6"

        style={{ background: COLORS.panel, border: `1px solid ${COLORS.brass}` }}

      >

        <div className="flex items-center gap-2 mb-1">

          <Lock size={18} color={COLORS.brass} />

          <StencilHeading as="h3" className="text-lg font-bold">Acesso Administrativo</StencilHeading>

        </div>

        <p className="text-xs mb-4" style={{ color: COLORS.paperDim }}>

    Analise todo o projeto e corrija todos os bugs que impedem o funcionamento do painel do administrador. Atualmente o login do administrador não funciona. Após autenticar com a senha correta, o usuário deve entrar no modo administrador, poder adicionar, editar, excluir e reorganizar técnicas, e todas as alterações devem ser salvas corretamente. Não altere o design nem a identidade visual do site; corrija apenas a lógica e os erros de funcionamento."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://armyfight.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c11e3ed9-d51d-497f-b05b-cba76d4759e4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
