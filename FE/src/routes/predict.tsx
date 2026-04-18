import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { districts, districtBasePrice } from "@/lib/mockData";
import { Calculator, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/predict")({
  head: () => ({ meta: [{ title: "Dự đoán Giá — SmartStay AI" }] }),
  component: PredictPage,
});

function PredictPage() {
  const [area, setArea] = useState([28]);
  const [district, setDistrict] = useState("Quận 10");
  const [studio, setStudio] = useState(false);
  const [balcony, setBalcony] = useState(true);
  const [furniture, setFurniture] = useState(true);
  const [elevator, setElevator] = useState(false);
  const [newBuild, setNewBuild] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { price: number; contributions: { name: string; value: number }[] }>(null);

  const predict = () => {
    setLoading(true); setResult(null);
    setTimeout(() => {
      const base = 1.2;
      const areaC = area[0] * 0.08;
      const locC = districtBasePrice[district] * 0.45;
      const studioC = studio ? 0.4 : 0;
      const balconyC = balcony ? 0.5 : 0;
      const furnC = furniture ? 1.2 : 0;
      const elevC = elevator ? 0.6 : 0;
      const newC = newBuild ? 0.8 : 0;
      const total = base + areaC + locC + studioC + balconyC + furnC + elevC + newC;
      const contributions = [
        { name: "Diện tích", value: areaC },
        { name: `Vị trí (${district})`, value: locC },
        { name: "Nội thất", value: furnC },
        { name: "Thang máy", value: elevC },
        { name: "Ban công", value: balconyC },
        { name: "Studio", value: studioC },
        { name: "Mới xây", value: newC },
      ].filter(c => c.value > 0).sort((a, b) => b.value - a.value);
      setResult({ price: total, contributions });
      setLoading(false);
    }, 1100);
  };

  return (
    <div className="space-y-8">
      <header className="text-center max-w-3xl mx-auto">
        <Badge variant="secondary" className="mb-3"><Calculator className="h-3 w-3 mr-1" /> Interactive AI</Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Dự đoán giá phòng trọ</h1>
        <p className="text-muted-foreground mt-4 text-lg">Nhập nhu cầu — AI ước tính mức giá hợp lý và giải thích lý do.</p>
      </header>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* INPUT */}
        <Card className="p-6 lg:col-span-2 h-fit lg:sticky lg:top-24">
          <h2 className="font-semibold text-lg mb-5 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Nhu cầu của bạn</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <Label>Diện tích</Label>
                <span className="text-sm font-semibold text-primary">{area[0]} m²</span>
              </div>
              <Slider value={area} onValueChange={setArea} min={10} max={80} step={1} />
            </div>
            <div>
              <Label className="mb-2 block">Vị trí (Quận)</Label>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 pt-2 border-t border-border">
              {[
                { l: "Studio (1 phòng đa năng)", v: studio, s: setStudio },
                { l: "Có ban công", v: balcony, s: setBalcony },
                { l: "Nội thất đầy đủ", v: furniture, s: setFurniture },
                { l: "Thang máy", v: elevator, s: setElevator },
                { l: "Tòa nhà mới (<3 năm)", v: newBuild, s: setNewBuild },
              ].map((t) => (
                <div key={t.l} className="flex items-center justify-between">
                  <Label className="text-sm font-normal cursor-pointer">{t.l}</Label>
                  <Switch checked={t.v} onCheckedChange={t.s} />
                </div>
              ))}
            </div>
            <Button onClick={predict} size="lg" className="w-full bg-gradient-hero text-primary-foreground shadow-glow hover:opacity-95">
              <Calculator className="h-4 w-4 mr-2" /> Dự đoán giá
            </Button>
          </div>
        </Card>

        {/* RESULT */}
        <div className="lg:col-span-3 space-y-5">
          <Card className="p-8 min-h-[300px] flex items-center justify-center bg-gradient-card">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full space-y-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-16 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <p className="text-center text-sm text-muted-foreground pt-4">🤖 Đang chạy mô hình Ensemble...</p>
                </motion.div>
              ) : result ? (
                <motion.div key="res" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Mức giá hợp lý</div>
                  <div className="text-6xl sm:text-7xl font-bold text-gradient">{result.price.toFixed(1)}<span className="text-2xl font-medium text-muted-foreground ml-2">tr/tháng</span></div>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm text-success bg-success/10 rounded-full px-4 py-1.5">
                    <TrendingUp className="h-4 w-4" /> Khoảng tin cậy: {(result.price * 0.92).toFixed(1)} – {(result.price * 1.08).toFixed(1)} triệu
                  </div>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>Điền thông tin và nhấn <span className="font-semibold text-foreground">Dự đoán giá</span></p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Tại sao mức giá này?</h3>
                    <p className="text-xs text-muted-foreground mt-1">Explainable AI — phân rã đóng góp từng yếu tố</p>
                  </div>
                  <Badge variant="secondary">SHAP</Badge>
                </div>
                <ResponsiveContainer width="100%" height={Math.max(220, result.contributions.length * 38)}>
                  <BarChart data={result.contributions} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis type="number" tick={{ fontSize: 11 }} unit=" tr" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={130} />
                    <Tooltip formatter={(v) => `+${Number(v).toFixed(2)} triệu`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--background)" }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {result.contributions.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "var(--primary)" : i === 1 ? "var(--primary-glow)" : "var(--chart-3)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-sm text-muted-foreground space-y-1">
                  {result.contributions.slice(0, 3).map(c => (
                    <div key={c.name}>• <span className="font-medium text-foreground">+{c.value.toFixed(2)}tr</span> nhờ <span className="font-medium">{c.name}</span></div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
