import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export function StorySection({
  step,
  title,
  whatDone,
  whyDone,
  insight,
  conclusion,
  children,
  className,
}: {
  step: number;
  title: string;
  whatDone: string;
  whyDone: string;
  insight: string;
  conclusion: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section {...reveal} className={cn("grid lg:grid-cols-[64px_1fr] gap-6 items-start", className)}>
      <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center font-bold text-primary-foreground glow-primary text-lg sticky top-6">
        {step}
      </div>
      <div className="space-y-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold mb-1">Bước {step}</div>
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>

        <Card className="glass-card p-5 sm:p-6">{children}</Card>

        <div className="grid md:grid-cols-2 gap-3">
          <Card className="glass-card p-5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">📋 Đã làm gì</div>
            <p className="text-sm leading-relaxed text-foreground/90">{whatDone}</p>
          </Card>
          <Card className="glass-card p-5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">🎯 Vì sao</div>
            <p className="text-sm leading-relaxed text-foreground/90">{whyDone}</p>
          </Card>
        </div>

        <Card className="glass-card p-5 border-primary/20">
          <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-2">💡 Insight từ kết quả</div>
          <p className="text-sm leading-relaxed text-foreground/90">{insight}</p>
        </Card>

        <div className="rounded-xl bg-gradient-to-r from-primary/15 to-accent/10 border-l-4 border-primary p-4">
          <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">✅ Kết luận</div>
          <p className="text-sm font-medium text-foreground">{conclusion}</p>
        </div>
      </div>
    </motion.section>
  );
}
