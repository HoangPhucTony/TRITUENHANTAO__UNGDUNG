import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell } from "recharts";
import { Sparkles, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { DISTRICTS, predictPrice, MODELS, type ModelKey } from "@/features/data/mockData";

const tooltipStyle = {
  background: "oklch(0.23 0.035 260)",
  border: "1px solid oklch(1 0 0 / 0.1)",
  borderRadius: 8,
  color: "oklch(0.97 0.01 260)",
  fontSize: 12,
};

export function PredictionPanel() {
  const [area, setArea] = useState(25);
  const [district, setDistrict] = useState("Quận 1");
  const [isStudio, setIsStudio] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(true);
  const [hasFurniture, setHasFurniture] = useState(true);
  const [hasElevator, setHasElevator] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [model, setModel] = useState<ModelKey | "auto">("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof predictPrice> | null>(null);

  const handlePredict = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const chosen: ModelKey = model === "auto" ? "ensemble" : model;
      setResult(predictPrice({ area, district, isStudio, hasBalcony, hasFurniture, hasElevator, isNew, model: chosen }));
      setLoading(false);
    }, 1100);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* LEFT: Input */}
      <Card className="glass-card p-6 space-y-6">
        <div>
          <h3 className="font-semibold mb-1">Thông tin phòng</h3>
          <p className="text-xs text-muted-foreground">Nhập đặc điểm phòng để AI dự đoán giá hợp lý.</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Diện tích</Label>
            <span className="text-sm font-semibold text-primary">{area} m²</span>
          </div>
          <Slider value={[area]} onValueChange={v => setArea(v[0])} min={15} max={80} step={1} />
        </div>

        <div className="space-y-2">
          <Label>Vị trí (quận)</Label>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Mô hình AI</Label>
            {model === "auto" && <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]"><Zap className="size-3 mr-1" />Auto</Badge>}
          </div>
          <Select value={model} onValueChange={v => setModel(v as ModelKey | "auto")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">🤖 Auto (gợi ý: Ensemble)</SelectItem>
              {MODELS.map(m => <SelectItem key={m.key} value={m.key}>{m.name} (R²={m.R2})</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">Hệ thống tự chọn Ensemble cho độ chính xác cao nhất, hoặc bạn có thể chọn thủ công.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { l: "Studio", v: isStudio, s: setIsStudio },
            { l: "Ban công", v: hasBalcony, s: setHasBalcony },
            { l: "Nội thất", v: hasFurniture, s: setHasFurniture },
            { l: "Thang máy", v: hasElevator, s: setHasElevator },
            { l: "Nhà mới", v: isNew, s: setIsNew },
          ].map(o => (
            <div key={o.l} className="flex items-center justify-between rounded-lg border border-border bg-foreground/5 px-3 py-2.5">
              <Label className="text-sm">{o.l}</Label>
              <Switch checked={o.v} onCheckedChange={o.s} />
            </div>
          ))}
        </div>

        <Button onClick={handlePredict} size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary">
          <Sparkles className="size-4 mr-2" /> Dự đoán giá
        </Button>
      </Card>

      {/* RIGHT: Result */}
      <Card className="glass-card p-6">
        <h3 className="font-semibold mb-4">Kết quả dự đoán</h3>
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="text-center py-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  className="size-12 rounded-full border-2 border-primary border-t-transparent mx-auto mb-3"
                />
                <p className="text-sm text-muted-foreground">AI đang phân tích {Object.keys({ area, district }).length}+ đặc trưng…</p>
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </motion.div>
          )}
          {!loading && result && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
              <div className="rounded-2xl bg-gradient-to-br from-primary/25 via-accent/15 to-primary/5 border border-primary/30 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="size-24" />
                </div>
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="size-3" />
                    Mức giá AI khuyến nghị
                  </div>
                  <div className="flex gap-2">
                    {result.confidence > 90 && (
                      <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px]">
                        ⭐ Premium
                      </Badge>
                    )}
                    <Badge className="bg-success/20 text-success border-success/30 text-[10px]">
                      <ShieldCheck className="size-3 mr-1" />Tin cậy {result.confidence}%
                    </Badge>
                  </div>
                </div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-5xl font-bold text-gradient relative z-10"
                >
                  {(result.price / 1_000_000).toFixed(1)} triệu
                </motion.div>
                <div className="text-sm text-muted-foreground mt-1 relative z-10">/ tháng · {area}m² · {district}</div>
                <div className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border flex justify-between items-center relative z-10">
                  <span>Mô hình: <span className="text-foreground font-medium">{result.model.name}</span></span>
                  <span className="font-mono opacity-80">MAE {result.model.MAE}tr</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium mb-3">
                  <TrendingUp className="size-4 text-primary" />
                  Vì sao giá này? — Explainable AI
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.factors} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid stroke="oklch(1 0 0 / 0.06)" horizontal={false} />
                      <XAxis type="number" stroke="oklch(0.72 0.025 260)" fontSize={11} tickFormatter={v => `${v >= 0 ? "+" : ""}${(v / 1_000_000).toFixed(1)}M`} />
                      <YAxis dataKey="label" type="category" stroke="oklch(0.72 0.025 260)" fontSize={11} width={130} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(1 0 0 / 0.05)" }} formatter={(v: number) => `${v >= 0 ? "+" : ""}${(v / 1_000_000).toFixed(2)} triệu`} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {result.factors.map((f, i) => (
                          <Cell key={i} fill={f.value >= 0 ? "oklch(0.65 0.21 265)" : "oklch(0.78 0.17 75)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {result.factors.map(f => (
                    <li key={f.label} className="flex items-center justify-between">
                      <span>• {f.label}</span>
                      <span className={f.value >= 0 ? "text-primary font-mono" : "text-warning font-mono"}>
                        {f.value >= 0 ? "+" : ""}{(f.value / 1_000_000).toFixed(2)}M
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
          {!loading && !result && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-80 grid place-items-center text-center text-muted-foreground">
              <div>
                <Sparkles className="size-10 mx-auto mb-3 text-primary/50" />
                <p className="text-sm">Nhập thông tin và bấm "Dự đoán giá" để xem kết quả</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
