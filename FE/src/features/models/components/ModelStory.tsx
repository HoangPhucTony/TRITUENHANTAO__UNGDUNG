import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Cpu,
  Layers,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, type ModelMetadataDto } from "@/lib/api";

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
    <div className="mb-5 flex items-start gap-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent font-bold text-primary-foreground glow-primary">
        {n}
      </div>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {desc ? <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p> : null}
      </div>
    </div>
  );
}

function formatMetric(value: number, suffix = "") {
  return `${Number(value).toFixed(2)}${suffix}`;
}

function metricMeaning(key: "MAE" | "RMSE" | "R2" | "MAPE") {
  if (key === "MAE") {
    return {
      title: "MAE",
      read: "Sai số tuyệt đối trung bình",
      rule: "Càng thấp càng tốt",
      desc: "Cho biết mỗi dự đoán lệch trung bình bao nhiêu triệu đồng so với giá thực tế. Đây là chỉ số dễ hiểu nhất với người dùng.",
    };
  }

  if (key === "RMSE") {
    return {
      title: "RMSE",
      read: "Sai số căn bậc hai trung bình",
      rule: "Càng thấp càng tốt",
      desc: "Phạt nặng hơn các dự đoán sai lệch lớn. Nếu RMSE cao hơn MAE nhiều, mô hình đang có một số dự đoán sai rất xa thực tế.",
    };
  }

  if (key === "R2") {
    return {
      title: "R²",
      read: "Mức độ giải thích biến thiên giá",
      rule: "Càng cao càng tốt",
      desc: "Cho biết mô hình giải thích được bao nhiêu phần biến động của giá thuê. Ví dụ R² = 0.60 nghĩa là mô hình giải thích được khoảng 60% biến thiên giá trong dữ liệu.",
    };
  }

  return {
    title: "MAPE",
    read: "Sai số phần trăm tuyệt đối trung bình",
    rule: "Càng thấp càng tốt",
    desc: "Cho biết dự đoán sai trung bình bao nhiêu phần trăm so với giá thật. Chỉ số này rất trực quan khi giải thích với người không chuyên.",
  };
}

function metricJudgement(model: ModelMetadataDto) {
  return [
    `MAE ${formatMetric(model.MAE)} cho thấy mỗi dự đoán lệch trung bình khoảng ${formatMetric(model.MAE, " triệu đồng")} so với giá thực tế.`,
    `RMSE ${formatMetric(model.RMSE)} phản ánh mức độ xuất hiện của các sai số lớn; chỉ số này càng gần MAE thì mô hình càng ổn định.`,
    `R² ${formatMetric(model.R2)} cho thấy mô hình giải thích được khoảng ${Math.round(model.R2 * 100)}% biến thiên giá thuê trong tập dữ liệu.`,
    `MAPE ${formatMetric(model.MAPE, "%")} cho biết sai số tương đối trung bình của mô hình so với giá thực tế.`,
  ];
}

function modelTypeLabel(type: ModelMetadataDto["type"]) {
  if (type === "basic") return "Cơ bản";
  if (type === "advanced") return "Nâng cao";
  return "Ensemble";
}

function modelTypeClass(type: ModelMetadataDto["type"]) {
  if (type === "advanced") return "border-primary/40 text-primary";
  if (type === "ensemble") return "border-success/40 text-success";
  return "";
}

export function ModelStory() {
  const [selected, setSelected] = useState<string>("xgb");
  const [ensembleOn, setEnsembleOn] = useState(false);

  const { data: models = [], isLoading } = useQuery<ModelMetadataDto[]>({
    queryKey: ["models"],
    queryFn: () => api.getModels(),
  });

  const nonEnsembleModels = models.filter((model) => model.key !== "ensemble");

  const compareData = nonEnsembleModels.map((model) => ({
    name: model.name.replace(" Regression", ""),
    MAE: model.MAE,
    RMSE: model.RMSE,
    type: model.type,
  }));

  const radarData = nonEnsembleModels.map((model) => ({
    model: model.name.split(" ")[0],
    accuracy: Math.round(model.R2 * 100),
    speed: model.speed,
    interpret: model.interpret,
  }));

  const metricSummary = useMemo(() => {
    if (!models.length) {
      return null;
    }

    return {
      bestMae: Math.min(...models.map((model) => model.MAE)),
      bestRmse: Math.min(...models.map((model) => model.RMSE)),
      bestR2: Math.max(...models.map((model) => model.R2)),
      bestMape: Math.min(...models.map((model) => model.MAPE)),
    };
  }, [models]);

  const selectedModel = models.find((model) => model.key === selected) ?? nonEnsembleModels[0] ?? null;
  const xgbModel = models.find((model) => model.key === "xgb");
  const ensembleModel = models.find((model) => model.key === "ensemble");

  return (
    <div className="space-y-12">
      <motion.section {...sectionAnim}>
        <SectionHeader n={1} title="Vì sao cần xây dựng mô hình?" desc="Động cơ của bài toán dự báo giá thuê." />
        <Card className="glass-card p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: AlertTriangle,
                color: "warning",
                title: "Vấn đề thị trường",
                desc: "Giá thuê biến động mạnh theo vị trí, diện tích và tiện ích. Người thuê khó biết mức giá nào là hợp lý nếu chỉ nhìn tiêu đề tin đăng.",
              },
              {
                icon: Brain,
                color: "primary",
                title: "Cơ hội của AI",
                desc: "Dữ liệu đã cho thấy những quy luật lặp lại giữa đặc trưng phòng và giá thuê. Đây là bài toán hồi quy giám sát phù hợp để máy học khai thác.",
              },
              {
                icon: CheckCircle2,
                color: "success",
                title: "Mục tiêu hệ thống",
                desc: "Không chỉ dự báo giá, hệ thống còn cần đưa ra con số đủ dễ hiểu để hỗ trợ so sánh, cảnh báo tin đăng bất thường và giải thích cho người dùng.",
              },
            ].map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl border border-border bg-foreground/5 p-4"
                >
                  <Icon className={`mb-2 size-5 text-${card.color}`} />
                  <div className="mb-1 font-semibold">{card.title}</div>
                  <div className="text-sm leading-relaxed text-muted-foreground">{card.desc}</div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.section>

      <motion.section {...sectionAnim}>
        <SectionHeader n={2} title="Cách đọc các chỉ số đánh giá" desc="Phần này giúp người đọc hiểu metric trước khi so sánh mô hình." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(["MAE", "RMSE", "R2", "MAPE"] as const).map((metric) => {
            const info = metricMeaning(metric);
            return (
              <Card key={metric} className="glass-card p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-lg font-bold">{info.title}</div>
                  <Badge variant="outline">{info.rule}</Badge>
                </div>
                <div className="mb-2 text-sm font-medium text-foreground/90">{info.read}</div>
                <p className="text-sm leading-relaxed text-muted-foreground">{info.desc}</p>
              </Card>
            );
          })}
        </div>
        <Card className="glass-card mt-4 p-4">
          <div className="text-sm leading-relaxed text-muted-foreground">
            Cách đọc nhanh:
            {" "}
            <strong>MAE</strong>, <strong>RMSE</strong> và <strong>MAPE</strong> dùng để đo sai số nên
            {" "}
            <strong>càng thấp càng tốt</strong>.
            {" "}
            <strong>R²</strong> dùng để đo mức độ mô hình giải thích được dữ liệu nên
            {" "}
            <strong>càng cao càng tốt</strong>.
          </div>
        </Card>
      </motion.section>

      <motion.section {...sectionAnim}>
        <SectionHeader n={3} title="Từ EDA đến lựa chọn thuật toán" desc="Vì sao từng họ mô hình được đưa vào so sánh." />
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-card border-l-4 border-l-primary p-6">
            <h4 className="mb-3 flex items-center gap-2 font-bold">
              <TrendingUp className="size-4 text-primary" />
              Lý do chọn nhóm tree-based
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Kết quả EDA cho thấy mối quan hệ giữa diện tích, vị trí, loại hình và giá thuê không hoàn toàn
              tuyến tính. Các mô hình như Decision Tree, Random Forest và XGBoost có khả năng nắm bắt những
              ngưỡng giá, điểm gãy và tương tác giữa biến tốt hơn mô hình tuyến tính cổ điển.
            </p>
          </Card>
          <Card className="glass-card border-l-4 border-l-accent p-6">
            <h4 className="mb-3 flex items-center gap-2 font-bold">
              <Sparkles className="size-4 text-accent" />
              Lý do chọn ensemble
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Mỗi mô hình có một điểm mạnh riêng: XGBoost mạnh về pattern phức tạp, Random Forest ổn định,
              KNN tốt trong so sánh các mẫu gần nhau. Ensemble giúp kết hợp ưu điểm của nhiều mô hình thay
              vì phụ thuộc hoàn toàn vào một mô hình đơn lẻ.
            </p>
          </Card>
        </div>
      </motion.section>

      <motion.section {...sectionAnim}>
        <SectionHeader n={4} title="Hồ sơ từng mô hình" desc="Mỗi mô hình được mô tả bằng dữ liệu đầu vào, đặc tính và cách hiểu các chỉ số." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nonEnsembleModels.map((model) => (
            <Card key={model.key} className="glass-card p-5 transition-colors hover:border-primary/40">
              <div className="mb-3 flex items-start justify-between">
                <div className="grid size-9 place-items-center rounded-lg" style={{ background: `${model.color}30` }}>
                  <Cpu className="size-4" style={{ color: model.color }} />
                </div>
                <Badge variant="outline" className={modelTypeClass(model.type)}>
                  {modelTypeLabel(model.type)}
                </Badge>
              </div>

              <h3 className="mb-3 font-semibold">{model.name}</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Input:</span>{" "}
                  <span className="text-foreground/90">{model.features}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Vì sao chọn:</span>{" "}
                  <span className="text-foreground/90">{model.whyChosen}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Đặc tính:</span>{" "}
                  <span className="text-foreground/90">{model.characteristics}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Điểm yếu:</span>{" "}
                  <span className="text-destructive/90">{model.weakness}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-foreground/5 p-3 text-center">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">MAE</div>
                  <div className="text-sm font-bold">{formatMetric(model.MAE)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">RMSE</div>
                  <div className="text-sm font-bold">{formatMetric(model.RMSE)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">R²</div>
                  <div className="text-sm font-bold">{formatMetric(model.R2)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">MAPE</div>
                  <div className="text-sm font-bold">{formatMetric(model.MAPE, "%")}</div>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
                {metricJudgement(model).slice(0, 2).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </motion.section>

      <motion.section {...sectionAnim}>
        <SectionHeader n={5} title="So sánh trực quan giữa các mô hình" desc="Biểu đồ này tập trung vào sai số tuyệt đối và sai số lớn." />
        <Card className="glass-card p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="oklch(0.72 0.025 260)" fontSize={12} />
                <YAxis stroke="oklch(0.72 0.025 260)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(1 0 0 / 0.05)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="MAE" name="MAE (triệu đồng)" radius={[4, 4, 0, 0]}>
                  {compareData.map((item, index) => (
                    <Cell
                      key={`cell-mae-${index}`}
                      fill={item.type === "basic" ? "oklch(0.78 0.17 75)" : "oklch(0.65 0.21 265)"}
                    />
                  ))}
                </Bar>
                <Bar dataKey="RMSE" name="RMSE (triệu đồng)" radius={[4, 4, 0, 0]}>
                  {compareData.map((item, index) => (
                    <Cell
                      key={`cell-rmse-${index}`}
                      fill={item.type === "basic" ? "oklch(0.7 0.2 25)" : "oklch(0.7 0.18 160)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
            <span className="font-semibold text-success">Cách diễn giải:</span>{" "}
            Cột càng thấp thì sai số dự báo càng nhỏ. Trong thực hành, nên đọc MAE để hiểu sai số trung bình và
            đọc thêm RMSE để xem mô hình có hay mắc các sai số lớn hay không.
          </div>
        </Card>
      </motion.section>

      <motion.section {...sectionAnim}>
        <SectionHeader n={6} title="Bảng tổng hợp metrics" desc="Bảng này thuận tiện cho việc đối chiếu trực tiếp từng chỉ số." />
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
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="ml-auto h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="ml-auto h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="ml-auto h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="ml-auto h-4 w-10" /></TableCell>
                    </TableRow>
                  ))
                : models.map((model) => (
                    <TableRow key={model.key} className="border-border hover:bg-foreground/5">
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={modelTypeClass(model.type)}>
                          {modelTypeLabel(model.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatMetric(model.MAE)}
                        {metricSummary && model.MAE === metricSummary.bestMae ? (
                          <Badge variant="outline" className="ml-2 border-success/40 text-success">Tốt nhất</Badge>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatMetric(model.RMSE)}
                        {metricSummary && model.RMSE === metricSummary.bestRmse ? (
                          <Badge variant="outline" className="ml-2 border-success/40 text-success">Tốt nhất</Badge>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatMetric(model.R2)}
                        {metricSummary && model.R2 === metricSummary.bestR2 ? (
                          <Badge variant="outline" className="ml-2 border-success/40 text-success">Tốt nhất</Badge>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatMetric(model.MAPE, "%")}
                        {metricSummary && model.MAPE === metricSummary.bestMape ? (
                          <Badge variant="outline" className="ml-2 border-success/40 text-success">Tốt nhất</Badge>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </Card>
      </motion.section>

      <motion.section {...sectionAnim}>
        <SectionHeader n={7} title="Ensemble model" desc="Kết hợp nhiều mô hình để giảm thiên lệch của từng mô hình đơn." />
        <Card className="glass-card relative overflow-hidden p-8">
          <div className="relative grid h-44 place-items-center">
            <AnimatePresence>
              {!ensembleOn
                ? [
                    { name: "RF", x: -150, c: "oklch(0.7 0.18 160)" },
                    { name: "XGB", x: 0, c: "oklch(0.65 0.21 265)" },
                    { name: "KNN", x: 150, c: "oklch(0.65 0.22 320)" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1, x: item.x }}
                      exit={{ opacity: 0, x: 0, scale: 0.5 }}
                      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                      className="absolute grid size-24 place-items-center rounded-2xl text-lg font-bold"
                      style={{ background: item.c, color: "oklch(0.15 0.02 260)" }}
                    >
                      {item.name}
                    </motion.div>
                  ))
                : null}
            </AnimatePresence>

            <AnimatePresence>
              {ensembleOn ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 150, damping: 15 }}
                  className="relative grid size-32 place-items-center rounded-3xl bg-gradient-to-br from-primary via-accent to-primary glow-primary"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-3xl border-2 border-dashed border-primary-foreground/30"
                  />
                  <Layers className="size-12 text-primary-foreground" />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {(["MAE", "RMSE", "R2", "MAPE"] as const).map((metric) => {
              const before = xgbModel ?? { MAE: 0, RMSE: 0, R2: 0, MAPE: 0 };
              const after = ensembleModel ?? { MAE: 0, RMSE: 0, R2: 0, MAPE: 0 };
              const value = ensembleOn ? after[metric] : before[metric];
              return (
                <div key={metric} className="rounded-xl border border-border bg-foreground/5 p-4 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {metric === "R2" ? "R²" : metric}
                  </div>
                  <motion.div
                    key={`${metric}-${ensembleOn}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-1 text-2xl font-bold ${ensembleOn ? "text-gradient" : "text-foreground"}`}
                  >
                    {formatMetric(value, metric === "MAPE" ? "%" : "")}
                  </motion.div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              size="lg"
              onClick={() => setEnsembleOn((value) => !value)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
            >
              <Sparkles className="mr-2 size-4" />
              {ensembleOn ? "Quay lại mô hình đơn" : "Kích hoạt ensemble"}
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Ensemble = 0.4 × XGBoost + 0.4 × Random Forest + 0.2 × KNN.
            {" "}
            Mục tiêu là tận dụng khả năng học pattern mạnh của XGBoost, tính ổn định của Random Forest và khả năng
            so sánh lân cận của KNN.
          </p>
        </Card>
      </motion.section>

      <motion.section {...sectionAnim}>
        <SectionHeader n={8} title="So sánh đa chiều và diễn giải cho người đọc" desc="Ngoài độ chính xác, phần này cho thấy tốc độ và khả năng giải thích của từng mô hình." />
        <Card className="glass-card p-6">
          <div className="mb-5 flex flex-wrap gap-2">
            {nonEnsembleModels.map((model) => (
              <Button
                key={model.key}
                variant={selected === model.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelected(model.key)}
                className={selected === model.key ? "bg-gradient-to-r from-primary to-accent" : ""}
              >
                {model.name}
              </Button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="relative h-72">
              {isLoading ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
                  <Loader2 className="animate-spin" />
                </div>
              ) : null}
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
                  <PolarAngleAxis dataKey="model" tick={{ fill: "oklch(0.72 0.025 260)", fontSize: 11 }} />
                  <Radar
                    name="Độ chính xác (R² × 100)"
                    dataKey="accuracy"
                    stroke="oklch(0.65 0.21 265)"
                    fill="oklch(0.65 0.21 265)"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Tốc độ dự đoán"
                    dataKey="speed"
                    stroke="oklch(0.7 0.18 160)"
                    fill="oklch(0.7 0.18 160)"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Khả năng giải thích"
                    dataKey="interpret"
                    stroke="oklch(0.78 0.17 75)"
                    fill="oklch(0.78 0.17 75)"
                    fillOpacity={0.2}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {selectedModel ? (
                <>
                  <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-accent/10 p-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Mô hình đang xem</div>
                    <div className="mt-1 text-lg font-bold">{selectedModel.name}</div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>MAE: <span className="font-bold">{formatMetric(selectedModel.MAE)}</span></div>
                      <div>RMSE: <span className="font-bold">{formatMetric(selectedModel.RMSE)}</span></div>
                      <div>R²: <span className="font-bold">{formatMetric(selectedModel.R2)}</span></div>
                      <div>MAPE: <span className="font-bold">{formatMetric(selectedModel.MAPE, "%")}</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-sm leading-relaxed text-muted-foreground">
                    <div className="mb-2 font-semibold text-foreground">Diễn giải nhanh cho người đọc</div>
                    <ul className="space-y-2">
                      {metricJudgement(selectedModel).map((line) => (
                        <li key={line}>- {line}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs leading-relaxed text-muted-foreground">
                    <strong className="text-foreground">Đặc tính mô hình:</strong> {selectedModel.characteristics}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </Card>
      </motion.section>
    </div>
  );
}
