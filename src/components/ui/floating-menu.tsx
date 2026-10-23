import { useId, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type FloatingMenuItem = {
  id: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  renderLink: (children: ReactNode, className: string) => ReactNode;
};

export function FloatingMenu({ items }: { items: FloatingMenuItem[] }) {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const highlighted = hovered ?? items.find((item) => item.active)?.id;

  return (
    <nav aria-label="Atalhos da academia" className="afc-floating-menu" onMouseLeave={() => setHovered(null)}>
      <ul className="flex w-full items-center gap-1">
        {items.map((item) => (
          <li key={item.id} className="relative min-w-0 flex-1" onMouseEnter={() => setHovered(item.id)}>
            {highlighted === item.id && (
              <motion.div
                layoutId={`${id}-liquid`}
                className="afc-floating-liquid absolute inset-0"
                transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 26 }}
                aria-hidden="true"
              />
            )}
            {item.renderLink(
              <><span className="relative flex justify-center">{item.icon}</span><span className="relative">{item.label}</span></>,
              cn("afc-floating-link relative flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px] uppercase sm:px-3 sm:text-xs", highlighted === item.id && "afc-floating-highlighted"),
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}