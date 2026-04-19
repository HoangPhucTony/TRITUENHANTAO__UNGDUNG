import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { Brain, Sparkles, AlertTriangle, CheckCircle2, Cpu, Layers } from "lucide-react";
import { MODELS, type ModelKey } from "@/features/data/mockData";

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

const modelDetails: Record<string, { features: string; whyChosen: string; characteristics: string; weakness: string }> = {
  "Linear Regression": {
    features: "Tất cả 24 features (sau encoding)",
    whyChosen: "Đơn giản, nhanh, dễ giải thích — làm baseline để đánh giá các mô hình phức tạp hơn.",
    characteristics: "Giả định mối quan hệ tuyến tính giữa feature và giá. Hệ số coefficient cho biết mức ảnh hưởng của từng biến.",
    weakness: "Không bắt được tương tác phi tuyến (vd: ảnh hưởng kép của diện tích × quận). MAPE cao (18.5%) không đủ chính xác cho production.",
  },
  "Decision Tree": {
    features: "Tất cả 24 features",
    whyChosen: "Bắt được quy tắc phi tuyến dạng if-then. Trực quan, dễ vẽ ra để giải thích cho stakeholders.",
    characteristics: "Chia dữ liệu theo các điều kiện (vd: quận = Quận 1 → giá cao). Không cần chuẩn hoá feature.",
    weakness: "Dễ overfit (max_depth không giới hạn). Variance cao — chỉ cần thay đổi nhỏ data là cây thay đổi nhiều.",
  },
  "KNN": {
    features: "Numerical features (đã chuẩn hoá Min-Max)",
    whyChosen: "Không cần training — phù hợp cho dataset nhỏ. Recommender system thường xài KNN.",
    characteristics: "Tìm K=5 phòng tương tự nhất rồi lấy trung bình giá. Distance metric: Euclidean.",
    weakness: "Chậm khi predict (phải so với toàn bộ dữ liệu). Nhạy cảm với feature scale và curse of dimensionality.",
  },
  "Random Forest": {
    features: "Tất cả 24 features",
    whyChosen: "Ensemble của nhiều Decision Tree → giảm variance, chống overfit. Robust với outlier.",
    characteristics: "100 trees, mỗi tree học trên một bootstrap sample khác nhau và một subset feature ngẫu nhiên. Predict bằng trung bình.",
    weakness: "Nặng hơn 1 cây đơn. Khó giải thích (black-box) so với 1 Decision Tree thuần.",
  },
  "XGBoost": {
    features: "Tất cả 24 features + interaction features",
    whyChosen: "State-of-the-art cho tabular data. Gradient boosting học được pattern phức tạp mà RF bỏ sót.",
    characteristics: "300 trees học tuần tự, mỗi cây sửa lỗi cây trước. L1/L2 regularization chống overfit. Hỗ trợ early stopping.",
    weakness: "Cần tune nhiều hyperparameter (learning_rate, max_depth, n_estimators). Training lâu hơn RF.",
  },
};

export function ModelStory() {
  const [selected, setSelected] = useState<ModelKey>("xgb");
  const [ensembleOn, setEnsembleOn] = useState(false);

  const compareData = MODELS.filter(m => m.key !== "ensemble").map(m => ({
    name: m.name.replace(" Regression", ""),
    MAE: m.MAE,
    RMSE: m.RMSE,
    MAPE: m.MAPE / 10, // scale for chart
    R2: m.R2,
    type: m.type,
  }));

  const radarData = MODELS.filter(m => m.key !== "ensemble").map(m => ({
    model: m.name.split(" ")[0],
    accuracy: Math.round(m.R2 * 100),
    speed: m.key === "knn" ? 35 : m.key === "linear" ? 95 : m.key === "tree" ? 88 : m.key === "rf" ? 65 : 70,
    interpret: m.key === "linear" ? 95 : m.key === "tree" ? 90 : m.key === "knn" ? 70 : m.key === "rf" ? 50 : 40,
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
            ].map(c => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="rounded-xl border border-border bg-foreground/5 p-4">
                  <Icon className={`size-5 mb-2 text-${c.color}`} />
                  <div className="font-semibold mb-1">{c.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{c.desc}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.section>

      {/* SECTION 2-3: Models grid */}
      <motion.section {...sectionAnim}>
        <SectionHeader n={2} title="Mô hình cơ bản & nâng cao" desc="Phân tích chi tiết từng mô hình: input, đặc tính, điểm yếu" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODELS.filter(m => m.key !== "ensemble").map(m => {
            const d = modelDetails[m.name];
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
                  <div><span className="text-muted-foreground">Input:</span> <span className="text-foreground/90">{d.features}</span></div>
                  <div><span className="text-muted-foreground">Vì sao chọn:</span> <span className="text-foreground/90">{d.whyChosen}</span></div>
                  <div><span className="text-muted-foreground">Đặc tính:</span> <span className="text-foreground/90">{d.characteristics}</span></div>
                  <div><span className="text-muted-foreground">Điểm yếu:</span> <span className="text-destructive/90">{d.weakness}</span></div>
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
                  {compareData.map((d, i) => <Cell key={i} fill={d.type === "basic" ? "oklch(0.78 0.17 75)" : "oklch(0.65 0.21 265)"} />)}
                </Bar>
                <Bar dataKey="RMSE" name="RMSE (tr)" radius={[4, 4, 0, 0]}>
                  {compareData.map((d, i) => <Cell key={i} fill={d.type === "basic" ? "oklch(0.7 0.2 25)" : "oklch(0.7 0.18 160)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 rounded-lg bg-success/10 border border-success/30 p-3 text-sm">
            <span className="font-semibold text-success">Kết quả:</span>{" "}
            XGBoost đạt MAE chỉ 0.41tr (giảm 50% so với Linear) và MAPE 7.1% — đủ tốt cho production.
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
              {MODELS.map(m => (
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
              const before = MODELS.find(m => m.key === "xgb")!;
              const after = MODELS.find(m => m.key === "ensemble")!;
              const v = ensembleOn ? after[k] : before[k];
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
            {MODELS.filter(m => m.key !== "ensemble").map(m => (
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
            <div className="h-72">
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
                const m = MODELS.find(x => x.key === selected)!;
                const d = modelDetails[m.name];
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
                    <div className="text-xs text-muted-foreground leading-relaxed">{d.characteristics}</div>
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
