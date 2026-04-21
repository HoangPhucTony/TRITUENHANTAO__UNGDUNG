import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, TrendingUp, Code2, Database, BrainCircuit, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TECH_STACK = [
  { name: "React + Vite", icon: Code2, color: "#61DAFB" },
  { name: "Python + XGBoost", icon: BrainCircuit, color: "#3776AB" },
  { name: "Pandas + Sklearn", icon: Database, color: "#150458" },
  { name: "Tailwind + Framer", icon: Globe, color: "#06B6D4" },
];

export function OverviewHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl glass-card p-10 mb-8 border-primary/20">
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-accent/20 blur-3xl" />
      
      <div className="grid lg:grid-cols-[1fr_300px] gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary mb-5">
            <Sparkles className="size-3" />
            AI-Powered Real Estate Ecosystem
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            <span className="text-gradient">SmartStay AI</span>
            <br />
            <span className="text-foreground/90 text-3xl md:text-4xl font-semibold">
              Khai phóng tiềm năng dữ liệu phòng trọ
            </span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            SmartStay AI không chỉ là một công cụ tìm kiếm, mà là một hệ sinh thái thông minh 
            giúp người dùng <span className="text-foreground font-medium">giải mã giá trị thực</span> 
            của bất động sản tại TP.HCM thông qua các thuật toán học máy tiên tiến nhất.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, title: "An toàn dữ liệu", desc: "Phát hiện tin ảo, lừa đảo bằng thuật toán so sánh giá AI." },
              { icon: TrendingUp, title: "Dự báo chính xác", desc: "Mô hình Ensemble đạt độ chính xác R² lên tới 0.96." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-4 rounded-2xl bg-foreground/5 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <f.icon className="size-4 text-primary" />
                  <span className="font-semibold text-sm">{f.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-2xl bg-foreground/[0.03] border border-border backdrop-blur-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Technology Stack</h3>
            <div className="space-y-3">
              {TECH_STACK.map((tech) => (
                <div key={tech.name} className="flex items-center gap-3 group">
                  <div className="size-8 rounded-lg bg-background border border-border grid place-items-center group-hover:border-primary/50 transition-colors">
                    <tech.icon className="size-4" style={{ color: tech.color }} />
                  </div>
                  <span className="text-sm font-medium text-foreground/80">{tech.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Dataset: PhongTro.xlsx</span>
                <span>1,399 records</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
