import { useState } from "react";
import { Pencil, Trash2, ChevronUp, ChevronDown, Plus, Save, X, Video, Image as ImageIcon } from "lucide-react";
import {
  COLORS,
  isVideoEmbed,
  toEmbed,
  useAfc,
  type CategoryKey,
  type Technique,
} from "@/lib/afc";
import { Button, Field, inputStyle } from "@/components/afc-ui";

export function TechniqueCard({
  technique,
  beltId,
  category,
  isFirst,
  isLast,
}: {
  technique: Technique;
  beltId: string;
  category: CategoryKey;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { isAdmin, deleteTechnique, moveTechnique } = useAfc();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <TechniqueEditor
        beltId={beltId}
        category={category}
        initial={technique}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div
      className="relative"
      style={{ background: COLORS.panel2, border: `1px solid ${COLORS.line}` }}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <button onClick={() => setExpanded((v) => !v)} className="text-left w-full">
            <div
              className="font-semibold uppercase tracking-wide text-sm sm:text-base"
              style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
            >
              {technique.title}
            </div>
            <p
              className={`text-xs sm:text-sm mt-1 ${expanded ? "" : "line-clamp-2"}`}
              style={{ color: COLORS.paperDim }}
            >
              {technique.description || "(sem descrição)"}
            </p>
          </button>

          {expanded && (
            <div className="mt-3 space-y-3">
              {technique.image && (
                <img
                  src={technique.image}
                  alt={technique.title}
                  className="w-full max-h-72 object-cover rounded-sm"
                  style={{ border: `1px solid ${COLORS.line}` }}
                />
              )}
              {technique.video && (
                <div
                  className="aspect-video w-full rounded-sm overflow-hidden"
                  style={{ border: `1px solid ${COLORS.line}` }}
                >
                  {isVideoEmbed(technique.video) ? (
                    <iframe
                      src={toEmbed(technique.video)}
                      title={technique.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <video src={technique.video} controls className="w-full h-full bg-black" />
                  )}
                </div>
              )}
              {!technique.image && !technique.video && (
                <div
                  className="text-xs italic px-3 py-2"
                  style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
                >
                  Sem mídia anexada.
                </div>
              )}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={() => moveTechnique(beltId, category, technique.id, -1)}
              disabled={isFirst}
              title="Mover para cima"
              className="p-1 hover:brightness-125 disabled:opacity-30"
              style={{ color: COLORS.paperDim }}
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() => moveTechnique(beltId, category, technique.id, 1)}
              disabled={isLast}
              title="Mover para baixo"
              className="p-1 hover:brightness-125 disabled:opacity-30"
              style={{ color: COLORS.paperDim }}
            >
              <ChevronDown size={16} />
            </button>
            <button
              onClick={() => setEditing(true)}
              title="Editar"
              className="p-1 hover:brightness-125"
              style={{ color: COLORS.brass }}
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Excluir "${technique.title}"?`)) {
                  deleteTechnique(beltId, category, technique.id);
                }
              }}
              title="Excluir"
              className="p-1 hover:brightness-125"
              style={{ color: "#e08070" }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function TechniqueEditor({
  beltId,
  category,
  initial,
  onDone,
}: {
  beltId: string;
  category: CategoryKey;
  initial?: Technique;
  onDone: () => void;
}) {
  const { addTechnique, updateTechnique } = useAfc();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [video, setVideo] = useState(initial?.video ?? "");
  const [image, setImage] = useState(initial?.image ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (initial) {
      updateTechnique(beltId, category, { ...initial, title, description, video, image });
    } else {
      addTechnique(beltId, category, { title, description, video, image });
    }
    onDone();
  }

  return (
    <form
      onSubmit={submit}
      className="p-4 space-y-3"
      style={{ background: COLORS.panel2, border: `1px solid ${COLORS.brass}` }}
    >
      <div
        className="text-xs uppercase tracking-widest"
        style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
      >
        {initial ? "Editar técnica" : "Nova técnica"}
      </div>
      <Field label="Título">
        <input
          style={inputStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </Field>
      <Field label="Explicação">
        <textarea
          style={{ ...inputStyle, minHeight: 90 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>
      <Field label="URL do vídeo (YouTube, Vimeo ou .mp4)">
        <div className="flex items-center gap-2">
          <Video size={16} color={COLORS.paperDim} />
          <input
            style={inputStyle}
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://youtu.be/..."
          />
        </div>
      </Field>
      <Field label="URL da imagem">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} color={COLORS.paperDim} />
          <input
            style={inputStyle}
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </Field>
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="brass">
          <Save size={14} /> Salvar
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          <X size={14} /> Cancelar
        </Button>
      </div>
    </form>
  );
}

export function AddTechniqueButton({
  beltId,
  category,
}: {
  beltId: string;
  category: CategoryKey;
}) {
  const [open, setOpen] = useState(false);
  if (open) {
    return (
      <TechniqueEditor beltId={beltId} category={category} onDone={() => setOpen(false)} />
    );
  }
  return (
    <Button variant="solid" onClick={() => setOpen(true)}>
      <Plus size={14} /> Adicionar técnica
    </Button>
  );
}