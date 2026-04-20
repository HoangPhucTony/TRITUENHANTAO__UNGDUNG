import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { Brain, Sparkles, AlertTriangle, CheckCircle2, Cpu, Layers, TrendingUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface ModelData {
  key: string;
  name: string;
  type: "basic" | "advanced" | "ensemble";
  MAE: number;
  RMSE: number;
  R2: number;
  MAPE: number;
  color: string;
  speed: number;
  interpret: number;
  features: string;
  whyChosen: string;
  characteristics: string;
  weakness: string;
}

const tooltipStyle = {
  background: "oklch(0.23 0.035 260)",
  border: "1px solid oklch(1 0 0 / 0.1)",
  borderRadius: 8,
  color: "oklch(0.97 0.01 260)",
  fontSize: 12,
};

const sectionAnim = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

function SectionHeader({ n, title, desc }: { n: number; title: string; desc?: string }) {
  return (
    <div className="flex items-start gap-4 mb-5">
      <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center font-bold text-primary-foreground glow-primary shrink-0">{n}</div>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {desc && <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

// Data is now fetched from Backend

export function ModelStory() {
  const [selected, setSelected] = useState<string>("xgb");
  const [ensembleOn, setEnsembleOn] = useState(false);

  const { data: models = [], isLoading } = useQuery<ModelData[]>({
    queryKey: ['models'],
    queryFn: () => api.getModels(),
  });

  const compareData = models.filter(m => m.key !== "ensemble").map(m => ({
    name: m.name.replace(" Regression", ""),
    MAE: m.MAE,
    RMSE: m.RMSE,
    MAPE: m.MAPE / 10, // scale for chart
    R2: m.R2,
    type: m.type,
  }));

  const radarData = models.filter(m => m.key !== "ensemble").map(m => ({
    model: m.name.split(" ")[0],
    accuracy: Math.round(m.R2 * 100),
    speed: m.speed,
    interpret: m.interpret,
  }));

  return (
    <div className="space-y-12">
      {/* SECTION 1: Why modeling */}
      <motion.section {...sectionAnim}>
        <SectionHeader n={1} title="Vì sao cần xây dựng mô hình?" desc="Dựa trên kết quả EDA" />
        <Card className="glass-card p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: AlertTriangle, color: "warning", title: "Vấn đề thị trường", desc: "EDA cho thấy giá phòng dao động lớn theo quận (3.5tr-7.5tr) và tiện ích. Người thuê khó biết mức giá hợp lý." },
              { icon: Brain, color: "primary", title: "Cơ hội AI", desc: "Pattern rõ ràng giữa các features (vị trí, diện tích, tiện ích) và giá → bài toán supervised regression cổ điển." },
              { icon: CheckCircle2, color: "success", title: "Mục tiêu", desc: "Xây mô hình dự đoán giá với MAPE < 10%, có thể giải thích được, hỗ trợ phát hiện tin lừa đảo." },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div 
                  key={c.title} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-foreground/5 p-4"
                >
                  <Icon className={`size-5 mb-2 text-${c.color}`} />
                  <div className="font-semibold mb-1">{c.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{c.desc}</div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.section>

      {/* NEW SECTION: EDA to Model Rationale */}
      <motion.section {...sectionAnim}>
        <SectionHeader n={2} title="Từ EDA đến lựa chọn thuật toán" desc="Tại sao chúng tôi chọn các mô hình này?" />
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card p-6 border-l-4 border-l-primary">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Lý do chọn Tree-based Models (XGBoost/RF)
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              EDA chỉ ra rằng mối quan hệ giữa Diện tích và Giá là <strong>phi tuyến (non-linear)</strong>. 
              Các yếu tố như Quận 1 có "premium" cực cao so với các quận khác. 
              Mô hình cây (Decision Tree) và các biến thể Ensemble của nó có khả năng bắt được 
              các <strong>điểm uốn</strong> và <strong>tương tác chéo</strong> (vd: Studio + Quận 1) 
              tốt hơn nhiều so với Linear Regression truyền thống.
            </p>
          </Card>
          <Card className="glass-card p-6 border-l-4 border-l-accent">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-accent" />
              Lý do chọn Ensemble Learning
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dữ liệu tin đăng có độ nhiễu cao. Một mô hình đơn lẻ thường dễ bị <strong>Overfitting</strong> 
              (quá khớp) hoặc <strong>Bias</strong> (sai số hệ thống). Việc kết hợp XGBoost (mạnh về học pattern) 
              với Random Forest (mạnh về tính ổn định) giúp tạo ra một "hội đồng chuyên gia", 
              tổng hòa ưu điểm và giảm thiểu sai lệch của từng cá nhân.
            </p>
          </Card>
        </div>
      </motion.section>

      {/* SECTION 2-3: Models grid */}
      <motion.section {...sectionAnim}>
        <SectionHeader n={2} title="Mô hình cơ bản & nâng cao" desc="Phân tích chi tiết từng mô hình: input, đặc tính, điểm yếu" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.filter(m => m.key !== "ensemble").map(m => {
            return (
              <Card key={m.key} className="glass-card p-5 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="size-9 rounded-lg grid place-items-center" style={{ background: m.color + "30" }}>
                    <Cpu className="size-4" style={{ color: m.color }} />
                  </div>
                  <Badge variant="outline" className={m.type === "advanced" ? "border-primary/40 text-primary" : ""}>
                    {m.type === "basic" ? "Cơ bản" : "Nâng cao"}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-3">{m.name}</h3>
                <div className="space-y-2 text-xs">
                  <div><span className="text-muted-foreground">Input:</span> <span className="text-foreground/90">{m.features}</span></div>
                  <div><span className="text-muted-foreground">Vì sao chọn:</span> <span className="text-foreground/90">{m.whyChosen}</span></div>
                  <div><span className="text-muted-foreground">Đặc tính:</span> <span className="text-foreground/90">{m.characteristics}</span></div>
                  <div><span className="text-muted-foreground">Điểm yếu:</span> <span className="text-destructive/90">{m.weakness}</span></div>
                </div>
                <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-[10px] text-muted-foreground">MAE</div><div className="text-sm font-bold">{m.MAE}</div></div>
                  <div><div className="text-[10px] text-muted-foreground">R²</div><div className="text-sm font-bold">{m.R2}</div></div>
                  <div><div className="text-[10px] text-muted-foreground">MAPE</div><div className="text-sm font-bold">{m.MAPE}%</div></div>
                </div>
              </Card>
            );
          })}
        </div>
      </motion.section>

      {/* SECTION 4: Visual comparison */}
      <motion.section {...sectionAnim}>
        <SectionHeader n={3} title="So sánh trực quan: Cơ bản vs Nâng cao" desc="Sự khác biệt rõ rệt về độ chính xác" />
        <Card className="glass-card p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="oklch(0.72 0.025 260)" fontSize={12} />
                <YAxis stroke="oklch(0.72 0.025 260)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(1 0 0 / 0.05)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="MAE" name="MAE (tr)" radius={[4, 4, 0, 0]}>
                  {compareData.map((d, i) => (
                    <Cell key={`cell-mae-${i}`} fill={d.type === "basic" ? "oklch(0.78 0.17 75)" : "oklch(0.65 0.21 265)"} />
                  ))}
                </Bar>
                <Bar dataKey="RMSE" name="RMSE (tr)" radius={[4, 4, 0, 0]}>
                  {compareData.map((d, i) => (
                    <Cell key={`cell-rmse-${i}`} fill={d.type === "basic" ? "oklch(0.7 0.2 25)" : "oklch(0.7 0.18 160)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 rounded-lg bg-success/10 border border-success/30 p-3 text-sm">
            <span className="font-semibold text-success">Kết quả:</span>{" "}
            {models.length > 0 ? (
              `Mô hình ${models.find(m => m.type === 'advanced')?.name || 'AI'} đạt hiệu suất vượt trội, giảm sai số đáng kể so với các phương pháp cơ bản.`
            ) : (
              "Đang phân tích dữ liệu hiệu suất..."
            )}
          </div>
        </Card>
      </motion.section>

      {/* SECTION 5: Comparison table */}
      <motion.section {...sectionAnim}>
        <SectionHeader n={4} title="Bảng tổng hợp metrics" />
        <Card className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Mô hình</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">MAE</TableHead>
                <TableHead className="text-right">RMSE</TableHead>
                <TableHead className="text-right">R²</TableHead>
                <TableHead className="text-right">MAPE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && models.map((m) => (
                <TableRow key={m.key} className="border-border hover:bg-foreground/5">
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={m.type === "advanced" ? "border-primary/40 text-primary" : m.type === "ensemble" ? "border-success/40 text-success" : ""}>
                      {m.type === "basic" ? "Cơ bản" : m.type === "advanced" ? "Nâng cao" : "Ensemble"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{m.MAE}</TableCell>
                  <TableCell className="text-right font-mono">{m.RMSE}</TableCell>
                  <TableCell className="text-right font-mono">{m.R2}</TableCell>
                  <TableCell className="text-right font-mono">{m.MAPE}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </motion.section>

      {/* SECTION 6: Ensemble */}
      <motion.section {...sectionAnim}>
        <SectionHeader n={5} title="Siêu Mô hình — Ensemble" desc="Kết hợp Random Forest + XGBoost + KNN với trọng số tối ưu" />
        <Card className="glass-card p-8 overflow-hidden relative">
          <div className="relative h-44 grid place-items-center">
            <AnimatePresence>
              {!ensembleOn && [
                { name: "RF", x: -150, c: "oklch(0.7 0.18 160)" },
                { name: "XGB", x: 0, c: "oklch(0.65 0.21 265)" },
                { name: "KNN", x: 150, c: "oklch(0.65 0.22 320)" },
              ].map((mdl, i) => (
                <motion.div
                  key={mdl.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, x: mdl.x }}
                  exit={{ opacity: 0, x: 0, scale: 0.5 }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                  className="absolute size-24 rounded-2xl grid place-items-center font-bold text-lg"
                  style={{ background: mdl.c, color: "oklch(0.15 0.02 260)" }}
                >
                  {mdl.name}
                </motion.div>
              ))}
            </AnimatePresence>
            <AnimatePresence>
              {ensembleOn && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 150, damping: 15 }}
                  className="size-32 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary grid place-items-center glow-primary relative"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-3xl border-2 border-dashed border-primary-foreground/30"
                  />
                  <Layers className="size-12 text-primary-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-6">
            {(["MAE", "RMSE", "R2", "MAPE"] as const).map(k => {
              const before = models.find(m => m.key === "xgb") || { MAE: 0, RMSE: 0, R2: 0, MAPE: 0 };
              const after = models.find(m => m.key === "ensemble") || { MAE: 0, RMSE: 0, R2: 0, MAPE: 0 };
              const v = ensembleOn ? (after as any)[k] : (before as any)[k];
              return (
                <div key={k} className="rounded-xl border border-border bg-foreground/5 p-4 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k === "R2" ? "R²" : k}</div>
                  <motion.div
                    key={`${k}-${ensembleOn}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-2xl font-bold mt-1 ${ensembleOn ? "text-gradient" : "text-foreground"}`}
                  >
                    {v}{k === "MAPE" ? "%" : ""}
                  </motion.div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              size="lg"
              onClick={() => setEnsembleOn(v => !v)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
            >
              <Sparkles className="size-4 mr-2" />
              {ensembleOn ? "Khởi động lại" : "Kích hoạt Siêu Mô hình"}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Ensemble = 0.4×XGBoost + 0.4×RandomForest + 0.2×KNN. Tận dụng điểm mạnh: XGB cho pattern phức tạp, RF cho stability, KNN cho local similarity.
          </p>
        </Card>
      </motion.section>

      {/* SECTION 7: Model selector */}
      <motion.section {...sectionAnim}>
        <SectionHeader n={6} title="Chọn mô hình & so sánh đa chiều" desc="So sánh độ chính xác, tốc độ và khả năng giải thích" />
        <Card className="glass-card p-6">
          <div className="flex flex-wrap gap-2 mb-5">
            {models.filter(m => m.key !== "ensemble").map(m => (
              <Button
                key={m.key}
                variant={selected === m.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelected(m.key)}
                className={selected === m.key ? "bg-gradient-to-r from-primary to-accent" : ""}
              >
                {m.name}
              </Button>
            ))}
          </div>
          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            <div className="h-72 relative">
              {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10"><Loader2 className="animate-spin" /></div>}
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
                  <PolarAngleAxis dataKey="model" tick={{ fill: "oklch(0.72 0.025 260)", fontSize: 11 }} />
                  <Radar name="Độ chính xác (R²)" dataKey="accuracy" stroke="oklch(0.65 0.21 265)" fill="oklch(0.65 0.21 265)" fillOpacity={0.3} />
                  <Radar name="Tốc độ predict" dataKey="speed" stroke="oklch(0.7 0.18 160)" fill="oklch(0.7 0.18 160)" fillOpacity={0.2} />
                  <Radar name="Khả năng giải thích" dataKey="interpret" stroke="oklch(0.78 0.17 75)" fill="oklch(0.78 0.17 75)" fillOpacity={0.2} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {(() => {
                const m = models.find(x => x.key === selected);
                if (!m) return null;
                return (
                  <>
                    <div className="rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 p-4">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Mô hình đang chọn</div>
                      <div className="text-lg font-bold mt-1">{m.name}</div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div>MAE: <span className="font-bold">{m.MAE}</span></div>
                        <div>RMSE: <span className="font-bold">{m.RMSE}</span></div>
                        <div>R²: <span className="font-bold">{m.R2}</span></div>
                        <div>MAPE: <span className="font-bold">{m.MAPE}%</span></div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{m.characteristics}</div>
                  </>
                );
              })()}
            </div>
          </div>
        </Card>
      </motion.section>
    </div>
  );
}
