import { useState, useEffect, useMemo } from "react";
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
import { Sparkles, TrendingUp, ShieldCheck, Zap, AlertCircle, Loader2 } from "lucide-react";
import { type ModelKey } from "@/features/data/mockData";
import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Factor {
  label: string;
  value: number;
}

interface PredictionResult {
  price: number;
  factors: Factor[];
  confidence: number;
  model: {
    key: string;
    name: string;
    MAE: number;
    R2: number;
  };
}

const tooltipStyle = {
  background: "oklch(0.23 0.035 260)",
  border: "1px solid oklch(1 0 0 / 0.1)",
  borderRadius: 8,
  color: "oklch(0.97 0.01 260)",
  fontSize: 12,
};

export function PredictionPanel() {
  const [area, setArea] = useState(25);
  const [district, setDistrict] = useState<string>("");
  const [isStudio, setIsStudio] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(true);
  const [hasFurniture, setHasFurniture] = useState(true);
  const [hasElevator, setHasElevator] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [hasMezzanine, setHasMezzanine] = useState(false);
  const [hasWindow, setHasWindow] = useState(true);
  const [model, setModel] = useState<ModelKey | "auto">("auto");
  const [result, setResult] = useState<PredictionResult | null>(null);

  // Queries
  const { data: models = [], isLoading: isLoadingModels } = useQuery<any[]>({
    queryKey: ['models'],
    queryFn: () => api.getModels(),
  });

  const { data: districts = [], isLoading: isLoadingDistricts } = useQuery<{ name: string, avg_price: number, count: number }[]>({
    queryKey: ['districts'],
    queryFn: () => api.getDistricts(),
  });

  // Handle default district
  useEffect(() => {
    if (districts.length > 0 && !district) {
      setDistrict(districts[0].name);
    }
  }, [districts, district]);

  const currentDistrict = useMemo(() => district || (districts[0]?.name) || "Quận 1", [district, districts]);

  // Mutation
  const mutation = useMutation({
    mutationFn: (data: any) => api.predict(data),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Dự đoán thành công!");
    },
    onError: (err: any) => {
      console.error("Prediction Error:", err);
      toast.error(err.message || "Không thể kết nối Backend. Vui lòng thử lại sau.");
    }
  });

  const handlePredict = () => {
    if (!currentDistrict) {
      toast.error("Vui lòng chọn vị trí!");
      return;
    }
    const chosen: ModelKey = model === "auto" ? "ensemble" : (model as ModelKey);
    mutation.mutate({
      area,
      district: currentDistrict,
      isStudio,
      hasBalcony,
      hasFurniture,
      hasElevator,
      isNew,
      hasMezzanine,
      hasWindow,
      model: chosen
    });
  };

  const isPredicting = mutation.isPending;

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      {/* LEFT: Input */}
      <Card className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Thông tin phòng</h3>
            <p className="text-xs text-muted-foreground">AI sẽ phân tích dựa trên đặc điểm bạn nhập.</p>
          </div>
          <div className="size-10 rounded-full bg-primary/10 grid place-items-center">
            <Zap className="size-5 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Diện tích</Label>
            <Badge variant="secondary" className="font-mono">{area} m²</Badge>
          </div>
          <Slider
            value={[area]}
            onValueChange={v => setArea(v[0])}
            min={15}
            max={80}
            step={1}
            className="py-4"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Vị trí (quận)</Label>
            <Select value={currentDistrict} onValueChange={setDistrict} disabled={isLoadingDistricts}>
              <SelectTrigger className="bg-foreground/5">
                <SelectValue placeholder={isLoadingDistricts ? "Đang tải..." : "Chọn quận"} />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Mô hình AI</Label>
            <Select value={model} onValueChange={v => setModel(v as ModelKey | "auto")}>
              <SelectTrigger className="bg-foreground/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">🤖 Auto (Ensemble)</SelectItem>
                {models.map(m => (
                  <SelectItem key={m.key} value={m.key}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { l: "Studio", v: isStudio, s: setIsStudio },
            { l: "Ban công", v: hasBalcony, s: setHasBalcony },
            { l: "Nội thất", v: hasFurniture, s: setHasFurniture },
            { l: "Thang máy", v: hasElevator, s: setHasElevator },
            { l: "Nhà mới", v: isNew, s: setIsNew },
            { l: "Gác lửng", v: hasMezzanine, s: setHasMezzanine },
            { l: "Cửa sổ", v: hasWindow, s: setHasWindow },
          ].map(o => (
            <div key={o.l} className="flex items-center justify-between rounded-xl border border-border/50 bg-foreground/5 px-3 py-2">
              <Label className="text-[11px] font-medium cursor-pointer" onClick={() => o.s(!o.v)}>{o.l}</Label>
              <Switch checked={o.v} onCheckedChange={(checked) => o.s(checked)} />
            </div>
          ))}
        </div>

        <Button
          onClick={handlePredict}
          disabled={isPredicting || isLoadingDistricts}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary transition-all active:scale-[0.98]"
        >
          {isPredicting ? (
            <><Loader2 className="size-4 mr-2 animate-spin" /> Đang tính toán...</>
          ) : (
            <><Sparkles className="size-4 mr-2" /> Dự đoán ngay</>
          )}
        </Button>
      </Card>

      {/* RIGHT: Result */}
      <Card className="glass-card p-6 min-h-[480px] flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="size-4 text-primary" />
          <h3 className="font-semibold">Kết quả phân tích</h3>
        </div>

        <AnimatePresence mode="wait">
          {isPredicting ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="size-20 rounded-full border-4 border-primary/20 border-t-primary"
                />
                <Sparkles className="absolute inset-0 m-auto size-6 text-primary animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium animate-pulse">AI đang phân tích các đặc trưng...</p>
                <div className="flex gap-1 justify-center">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="size-1.5 rounded-full bg-primary"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 flex-1 flex flex-col"
            >
              {/* Price Display */}
              <div className="rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent border border-primary/20 p-8 text-center relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 size-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Giá thuê gợi ý</div>
                <div className="text-6xl font-black text-gradient">
                  {(result.price / 1_000_000).toFixed(1)} <span className="text-2xl font-bold">triệu</span>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20">
                    <ShieldCheck className="size-3 mr-1 text-success" /> Tin cậy {result.confidence}%
                  </Badge>
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20">
                    {result.model.name}
                  </Badge>
                </div>
              </div>

              {/* Factors Chart */}
              <div className="flex-1 space-y-4">
                <div className="text-sm font-medium flex items-center gap-2 px-1">
                  <ShieldCheck className="size-4 text-primary" />
                  Các yếu tố ảnh hưởng
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.factors} layout="vertical" margin={{ left: -10, right: 40 }}>
                      <CartesianGrid stroke="oklch(1 0 0 / 0.05)" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="label"
                        type="category"
                        stroke="var(--color-muted-foreground)"
                        fontSize={10}
                        width={120}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-primary)", fillOpacity: 0.05 }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {result.factors.map((f, i) => (
                          <Cell
                            key={`cell-${i}`}
                            fill={f.value >= 0 ? "var(--color-primary)" : "var(--color-warning)"}
                            fillOpacity={0.8}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {result.factors.map(f => (
                    <div key={f.label} className="text-[10px] flex items-center justify-between px-2 py-1.5 rounded-lg bg-foreground/5 border border-border/30">
                      <span className="text-muted-foreground truncate mr-2">{f.label}</span>
                      <span className={`font-bold ${f.value >= 0 ? "text-primary" : "text-warning"}`}>
                        {f.value >= 0 ? "+" : ""}{(f.value / 1_000_000).toFixed(1)}M
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4"
            >
              <div className="size-16 rounded-2xl bg-foreground/5 border border-dashed border-border grid place-items-center">
                <Sparkles className="size-8 text-primary/30" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Chưa có dữ liệu dự đoán</p>
                <p className="text-xs text-muted-foreground max-w-[200px]">Điền thông tin và bấm nút dự đoán để AI bắt đầu làm việc.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
