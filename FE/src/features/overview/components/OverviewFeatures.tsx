import { motion } from "framer-motion";
import { Brain, MapPin, ShieldAlert, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  { icon: Brain, title: "Machine Learning", desc: "Random Forest & XGBoost được huấn luyện trên 10,000+ tin đăng thực tế.", stat: "94%", statLabel: "Độ chính xác" },
  { icon: MapPin, title: "Spatial Analysis", desc: "Phân tích vị trí, khoảng cách trường học, bệnh viện và vùng ngập.", stat: "10+", statLabel: "Quận/huyện" },
  { icon: ShieldAlert, title: "Scam Detection", desc: "So sánh giá đăng với giá AI để phát hiện tin lừa đảo tiềm ẩn.", stat: "1.4x", statLabel: "Ngưỡng cảnh báo" },
  { icon: TrendingUp, title: "Recommender", desc: "Gợi ý phòng phù hợp với ngân sách và nhu cầu cá nhân của bạn.", stat: "24+", statLabel: "Tin gợi ý" },
] as const;

export function OverviewFeatures() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {features.map((f, i) => {
        const Icon = f.icon;
        return (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card className="glass-card p-5 h-full hover:border-primary/40 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="size-10 rounded-lg bg-primary/15 grid place-items-center group-hover:bg-primary/25 transition-colors">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gradient">{f.stat}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.statLabel}</div>
                </div>
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          </motion.div>
        );
      })}
    </section>
  );
}
