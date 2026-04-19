import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, TrendingUp } from "lucide-react";

export function OverviewHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl glass-card p-10 mb-8">
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-accent/30 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary mb-5">
          <Sparkles className="size-3" />
          AI-Powered Real Estate Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
          <span className="text-gradient">SmartStay AI</span>
          <br />
          <span className="text-foreground/90 text-3xl md:text-4xl font-semibold">
            Nền tảng định giá và gợi ý trọ thông minh
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          Kết hợp <span className="text-foreground font-medium">Machine Learning</span>,{" "}
          <span className="text-foreground font-medium">Recommender System</span> và{" "}
          <span className="text-foreground font-medium">Spatial Analysis</span> để định giá chính xác,
          gợi ý cá nhân hoá và phát hiện tin đăng bất thường.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { icon: Sparkles, label: "Gợi ý thông minh" },
            { icon: ShieldCheck, label: "Phát hiện lừa đảo" },
            { icon: TrendingUp, label: "Dự đoán giá" },
          ].map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="inline-flex items-center gap-2 rounded-full bg-foreground/5 border border-border px-4 py-2 text-sm"
            >
              <b.icon className="size-4 text-primary" />
              {b.label}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
