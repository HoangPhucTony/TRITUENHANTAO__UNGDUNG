import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { basicModels, advancedModels, ensembleResult, featureImportance } from "@/lib/mockData";
import { Sparkles, Zap, AlertTriangle, CheckCircle2, Brain } from "lucide-react";

export const Route = createFileRoute("/model")({
  head: () => ({ meta: [{ title: "Huấn luyện Mô hình — SmartStay AI" }] }),
  component: ModelPage,
});

function MetricCard({ label, value, suffix = "", trend }: { label: string; value: number | string; suffix?: string; trend?: "up" | "down" }) {
  return (
    <div className="rounded-xl bg-background/60 border border-border p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1 flex items-baseline gap-1">
        <motion.span key={String(value)} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>{value}</motion.span>
        <span className="text-sm text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

function ModelPage() {
  const [ensembleActive, setEnsembleActive] = useState(false);
  const [animating, setAnimating] = useState(false);

  const trigger = () => {
    setAnimating(true);
    setTimeout(() => { setEnsembleActive(true); setAnimating(false); }, 1800);
  };

  const currentMetrics = ensembleActive ? ensembleResult : advancedModels[1];

  return (
    <div className="space-y-16">
      <header className="text-center max-w-3xl mx-auto">
        <Badge variant="secondary" className="mb-3"><Brain className="h-3 w-3 mr-1" /> AI Black Box</Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Hành trình huấn luyện mô hình</h1>
        <p className="text-muted-foreground mt-4 text-lg">Từ baseline đơn giản đến Ensemble siêu mô hình — mỗi bước là một bài học.</p>
      </header>

      {/* PHASE 1 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Badge className="bg-primary/10 text-primary border-primary/20">Phase 1</Badge>
          <h2 className="text-2xl font-bold">Mô hình cơ bản (Baselines)</h2>
        </div>
        <p className="text-muted-foreground mb-6 max-w-3xl">So sánh ba mô hình kinh điển: <span className="font-medium">Linear Regression</span>, <span className="font-medium">Decision Tree</span> và <span className="font-medium">KNN</span>. Đo bằng 4 chỉ số chuẩn của bài toán hồi quy.</p>
        <Card className="p-6">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={basicModels}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="model" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--background)" }} />
              <Bar dataKey="MAE" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="RMSE" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="R2" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="MAPE" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 text-xs mt-4 justify-center text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: "var(--chart-1)" }} /> MAE</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: "var(--chart-2)" }} /> RMSE</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: "var(--chart-3)" }} /> R²</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: "var(--chart-4)" }} /> MAPE (%)</span>
          </div>
        </Card>
        <Card className="p-5 mt-5 bg-warning/10 border-warning/30">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold">Hạn chế:</span> Linear Regression giả định quan hệ tuyến tính → underfit dữ liệu phi tuyến. Decision Tree dễ overfit. KNN chậm khi dữ liệu lớn. R² tốt nhất chỉ đạt <span className="font-semibold">0.74</span> — chưa đủ cho production.
            </div>
          </div>
        </Card>
      </section>

      {/* PHASE 2 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Badge className="bg-primary/10 text-primary border-primary/20">Phase 2</Badge>
          <h2 className="text-2xl font-bold">Mô hình nâng cao (Ensemble Trees)</h2>
        </div>
        <p className="text-muted-foreground mb-6 max-w-3xl">Random Forest và XGBoost xử lý tốt phi tuyến, tương tác giữa các feature, và khả năng tổng quát hoá vượt trội.</p>
        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">So sánh chỉ số</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={advancedModels}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="model" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--background)" }} />
                <Bar dataKey="MAE" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="RMSE" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="R2" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="MAPE" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-1">Feature Importance (SHAP)</h3>
            <p className="text-xs text-muted-foreground mb-4">Yếu tố quyết định giá thuê</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={featureImportance} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--background)" }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card className="p-5 mt-5 bg-success/10 border-success/30">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div className="text-sm"><span className="font-semibold">XGBoost vượt trội:</span> R² = 0.92, RMSE giảm còn 0.54. <span className="font-medium">Diện tích, Vị trí, Nội thất</span> là 3 yếu tố quan trọng nhất — phù hợp với insight EDA.</div>
          </div>
        </Card>
      </section>

      {/* PHASE 3 — ENSEMBLE */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Badge className="bg-gradient-hero text-primary-foreground border-0">Phase 3</Badge>
          <h2 className="text-2xl font-bold">Auto-Ensemble — Siêu mô hình</h2>
        </div>
        <Card className="p-8 bg-gradient-hero text-primary-foreground shadow-glow border-0 overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,white,transparent_50%)]" />
          <div className="relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2"><Zap className="h-6 w-6" /> Kết hợp Best Basic + Best Advanced</h3>
                <p className="opacity-85 mt-2 text-sm">KNN (basic) + XGBoost (advanced) → Stacking Ensemble với meta-learner</p>
              </div>
              <Button onClick={trigger} disabled={animating || ensembleActive} size="lg" variant="secondary" className="shadow-elegant">
                <Sparkles className="h-4 w-4 mr-2" />
                {ensembleActive ? "✓ Siêu mô hình đã kích hoạt" : animating ? "Đang hợp nhất..." : "Kích hoạt Siêu Mô hình (Ensemble)"}
              </Button>
            </div>

            {/* Animation */}
            <AnimatePresence>
              {animating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-6 py-8">
                  <motion.div initial={{ x: -100 }} animate={{ x: 0 }} transition={{ duration: 1.2 }} className="glass rounded-xl px-5 py-3 font-semibold">KNN</motion.div>
                  <motion.div animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Sparkles className="h-8 w-8" />
                  </motion.div>
                  <motion.div initial={{ x: 100 }} animate={{ x: 0 }} transition={{ duration: 1.2 }} className="glass rounded-xl px-5 py-3 font-semibold">XGBoost</motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard label="MAE" value={currentMetrics.MAE.toFixed(2)} suffix="tr" />
              <MetricCard label="RMSE" value={currentMetrics.RMSE.toFixed(2)} suffix="tr" />
              <MetricCard label="R²" value={currentMetrics.R2.toFixed(2)} />
              <MetricCard label="MAPE" value={currentMetrics.MAPE.toFixed(1)} suffix="%" />
            </div>

            {ensembleActive && (
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-sm opacity-90">
                🚀 <span className="font-semibold">Cải thiện vượt trội:</span> R² tăng từ 0.92 → <span className="font-bold">0.96</span>, RMSE giảm 24%. Đây là mô hình đang chạy production của SmartStay AI.
              </motion.p>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
