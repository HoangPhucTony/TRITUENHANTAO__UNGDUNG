import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("mb-8", className)}
    >
      {eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary mb-3">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          {eyebrow}
        </div>
      )}
      <h1 className="text-4xl font-bold tracking-tight text-gradient">{title}</h1>
      {description && (
        <p className="mt-3 text-base text-muted-foreground max-w-2xl">{description}</p>
      )}
    </motion.div>
  );
}
