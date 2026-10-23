import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type ContainerScrollProps = {
  titleComponent?: ReactNode;
  children: ReactNode;
  className?: string;
  appearance?: "framed" | "plain";
};

export function ContainerScroll({ titleComponent, children, className, appearance = "framed" }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [appearance === "plain" ? 8 : 20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.98, 1] : [1, 0.98]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -12 : -32]);

  return (
    <div ref={containerRef} className={cn("afc-scroll-container relative w-full", className)}>
      {titleComponent && <Header translate={translate} reducedMotion={!!reducedMotion} titleComponent={titleComponent} />}
      <Card rotate={rotate} scale={scale} appearance={appearance} reducedMotion={!!reducedMotion}>
        {children}
      </Card>
    </div>
  );
}

export function Header({ translate, titleComponent, reducedMotion = false }: {
  translate: MotionValue<number>;
  titleComponent: ReactNode;
  reducedMotion?: boolean;
}) {
  return <motion.div style={{ translateY: reducedMotion ? 0 : translate }} className="relative z-10 mx-auto max-w-5xl text-center">{titleComponent}</motion.div>;
}

export function Card({ rotate, scale, children, appearance = "framed", reducedMotion = false }: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: ReactNode;
  appearance?: "framed" | "plain";
  reducedMotion?: boolean;
}) {
  return (
    <motion.div
      style={{ rotateX: reducedMotion ? 0 : rotate, scale: reducedMotion ? 1 : scale }}
      className={cn("afc-scroll-surface w-full", appearance === "framed" && "afc-scroll-frame mx-auto max-w-5xl rounded-lg border p-2 md:p-6")}
    >
      {children}
    </motion.div>
  );
}