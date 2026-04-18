import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, Shield, TrendingUp, Sparkles, Database, MapPin, Cpu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { rawDataSample } from "@/lib/mockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tổng quan — SmartStay AI" },
      { name: "description", content: "Nền tảng định giá và gợi ý trọ thông minh ứng dụng Machine Learning." },
    ],
  }),
  component: OverviewPage,
});

const features = [
  { icon: Sparkles, title: "Smart Recommendation", desc: "Gợi ý phòng trọ phù hợp dựa trên ngân sách, vị trí và nhu cầu cá nhân." },
  { icon: Shield, title: "Scam Detection", desc: "Phát hiện tin đăng giá bất thường, cảnh báo người dùng tránh lừa đảo." },
  { icon: TrendingUp, title: "Price Prediction", desc: "Dự đoán mức giá hợp lý theo thời gian thực với độ chính xác R² = 0.96." },
];

const tech = [
  { icon: Brain, label: "Machine Learning", desc: "XGBoost · Random Forest · Ensemble" },
  { icon: Cpu, label: "Recommender System", desc: "Content-based · Collaborative Filtering" },
  { icon: MapPin, label: "Spatial Analysis", desc: "Geo-features · Heatmap · POI" },
];

function OverviewPage() {
  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 sm:p-12 lg:p-16 shadow-glow">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
        <div className="relative grid lg:grid-cols-5 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-3 text-primary-foreground">
            <Badge className="bg-white/15 text-primary-foreground border-white/20 backdrop-blur mb-5">
              <Sparkles className="h-3 w-3 mr-1.5" /> AI-Powered PropTech
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              SmartStay AI
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-medium opacity-90 mt-3">
                Nền tảng định giá & gợi ý trọ thông minh
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg opacity-85 max-w-2xl">
              Hành trình từ <span className="font-semibold">dữ liệu thô</span> đến một <span className="font-semibold">sản phẩm PropTech hoàn chỉnh</span> — ứng dụng Machine Learning để giúp người thuê tìm được nơi ở phù hợp, an toàn và đúng giá.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="shadow-elegant">
                <Link to="/demo">Trải nghiệm Demo <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20">
                <Link to="/eda">Khám phá hành trình dữ liệu</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="lg:col-span-2 grid grid-cols-2 gap-3">
            {[
              { v: "0.96", l: "R² Score" },
              { v: "5.4%", l: "MAPE" },
              { v: "12K+", l: "Tin đăng" },
              { v: "24", l: "Quận/Huyện" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl p-5 text-primary-foreground">
                <div className="text-3xl font-bold">{s.v}</div>
                <div className="text-xs uppercase tracking-wider opacity-80 mt-1">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TECHNOLOGIES */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="secondary" className="mb-3">Công nghệ lõi</Badge>
          <h2 className="text-3xl font-bold tracking-tight">Sức mạnh đứng sau SmartStay</h2>
          <p className="text-muted-foreground mt-3">Kết hợp Machine Learning, hệ gợi ý và phân tích không gian địa lý.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {tech.map((t, i) => (
            <motion.div key={t.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="p-6 h-full bg-gradient-card border-border/60 hover:shadow-elegant transition-shadow">
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <t.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg">{t.label}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">{t.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="secondary" className="mb-3">Tính năng nổi bật</Badge>
          <h2 className="text-3xl font-bold tracking-tight">Ba trụ cột sản phẩm</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="p-7 h-full border-border/60 hover:border-primary/40 hover:-translate-y-1 transition-all">
                <f.icon className="h-8 w-8 text-primary mb-4" strokeWidth={1.5} />
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DATA TRANSPARENCY */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <Badge variant="secondary" className="mb-3"><Database className="h-3 w-3 mr-1" /> Minh bạch dữ liệu</Badge>
            <h2 className="text-3xl font-bold tracking-tight">Bộ dữ liệu nguồn: <span className="font-mono text-primary">PhongTro.xlsx</span></h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">Crawl từ <span className="font-medium">phongtro123.com</span> — hơn 12.000 tin đăng, là điểm khởi đầu cho toàn bộ pipeline xử lý và mô hình hóa.</p>
          </div>
          <Badge variant="outline" className="text-xs">5 / 12.453 dòng mẫu</Badge>
        </div>
        <Card className="overflow-hidden border-border/60 shadow-soft">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tiêu đề</TableHead>
                <TableHead className="text-right">Diện tích</TableHead>
                <TableHead className="text-right">Giá (triệu)</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Tiện ích</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawDataSample.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell className="text-right">{r.area} m²</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{r.price}</TableCell>
                  <TableCell><Badge variant="outline">{r.location}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.amenities}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
}
