import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, ShieldAlert, MapPin, Maximize2, AlertTriangle, School, Hospital, Droplets, TrendingDown, TrendingUp as TrendUp, Lightbulb, Map, Loader2 } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { type Property } from "@/features/data/mockData";
import { PropertyMap } from "./PropertyMap";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type SortKey = "score" | "price" | "amenities";

export function DemoExperience() {
  const [budget, setBudget] = useState(6);
  const [nearSchool, setNearSchool] = useState(false);
  const [nearHospital, setNearHospital] = useState(false);
  const [floodSafe, setFloodSafe] = useState(true);
  const [avoidDanger, setAvoidDanger] = useState(true);
  const [sort, setSort] = useState<SortKey>("score");

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['properties', budget],
    queryFn: () => api.getProperties({ maxPrice: budget }),
  });

  const { data: districts = [] } = useQuery<{name: string, avg_price: number, count: number}[]>({
    queryKey: ['districts'],
    queryFn: () => api.getDistricts(),
  });

  const ranked = useMemo(() => {
    const processed = properties.map((p) => {
      // Composite ranking score logic (can keep FE-side for interactivity)
      const priceMatch = Math.max(0, 100 - Math.abs(p.aiPrice / 1_000_000 - budget) * 15);
      const locationScore = ["Quận 1", "Quận 3", "Quận 10"].includes(p.district) ? 90 : 65;
      const amenityScore = Math.min(100, (p.amenities?.length || 0) * 14);
      const score = Math.round(priceMatch * 0.5 + locationScore * 0.25 + amenityScore * 0.25);
      return { ...p, score, priceMatch, locationScore, amenityScore };
    });

    if (sort === "price") return processed.sort((a, b) => a.price - b.price);
    if (sort === "amenities") return processed.sort((a, b) => (b.amenities?.length || 0) - (a.amenities?.length || 0));
    return processed.sort((a, b) => b.score - a.score);
  }, [properties, budget, sort]);

  // Smart suggestion
  const affordableDistricts = useMemo(() => {
    return districts
      .filter(d => d.avg_price / 1_000_000 <= budget + 0.5)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(d => d.name);
  }, [districts, budget]);

  const showAlert = budget < 4 && ranked.length > 0 && !ranked.some(p => ["Quận 1", "Quận 3", "Quận 10"].includes(p.district));

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      {/* Filters */}
      <Card className="glass-card p-6 h-fit space-y-6 lg:sticky lg:top-6">
        <div>
          <h3 className="font-semibold mb-1">Bộ lọc thông minh</h3>
          <p className="text-xs text-muted-foreground">Tích hợp dữ liệu ngoài: trường học, bệnh viện, vùng ngập</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Ngân sách tối đa</Label>
            <span className="text-sm font-semibold text-primary">{budget} triệu</span>
          </div>
          <Slider value={[budget]} onValueChange={v => setBudget(v[0])} min={2} max={12} step={0.5} />
        </div>
        <div className="space-y-2">
          {[
            { l: "Gần trường học", v: nearSchool, s: setNearSchool, icon: School },
            { l: "Gần bệnh viện", v: nearHospital, s: setNearHospital, icon: Hospital },
            { l: "Tránh vùng ngập", v: floodSafe, s: setFloodSafe, icon: Droplets },
            { l: "Tránh khu nguy hiểm", v: avoidDanger, s: setAvoidDanger, icon: AlertTriangle },
          ].map(o => {
            const Icon = o.icon;
            return (
              <div key={o.l} className="flex items-center justify-between rounded-lg border border-border bg-foreground/5 px-3 py-2.5">
                <Label className="text-sm flex items-center gap-2"><Icon className="size-3.5 text-muted-foreground" />{o.l}</Label>
                <Switch checked={o.v} onCheckedChange={o.s} />
              </div>
            );
          })}
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Sắp xếp theo</Label>
          <Select value={sort} onValueChange={v => setSort(v as SortKey)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="score">⭐ Điểm match (cao→thấp)</SelectItem>
              <SelectItem value="price">💰 Giá (thấp→cao)</SelectItem>
              <SelectItem value="amenities">✨ Tiện ích (nhiều→ít)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 text-center">
          <div className="text-2xl font-bold text-gradient">{ranked.length}</div>
          <div className="text-xs text-muted-foreground">Phòng phù hợp</div>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <AnimatePresence>
          {showAlert && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Alert className="border-warning/40 bg-warning/10">
                <Lightbulb className="size-4 text-warning" />
                <AlertDescription className="text-foreground">
                  <strong>Gợi ý thông minh:</strong> Với <strong>{budget} triệu</strong> không thể thuê phòng tại Quận 1, Quận 3.
                  Hãy cân nhắc <strong>{affordableDistricts.slice(0, 3).join(", ")}</strong> — vẫn có nhiều lựa chọn tốt!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Leaflet Map */}
        <Card className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Map className="size-4 text-primary" />
              <span className="font-semibold text-sm">Bản đồ vị trí</span>
              <Badge variant="outline" className="text-[10px]">{ranked.length} phòng</Badge>
            </div>
            {isLoading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          </div>
          <div className="px-4 pb-4">
            <PropertyMap properties={ranked.slice(0, 12)} />
          </div>
        </Card>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading && Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card p-4 h-[300px] flex flex-col gap-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="flex-1 w-full" />
            </Card>
          ))}
          <AnimatePresence mode="popLayout">
            {!isLoading && ranked.slice(0, 12).map((p, i) => {
              const ratio = p.price / p.aiPrice;
              const isOverpriced = ratio > 1.3;
              const isSuspiciouslyCheap = ratio < 0.6;
              const isFair = !isOverpriced && !isSuspiciouslyCheap;
              const diff = p.price - p.aiPrice;
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="glass-card p-4 h-full hover:border-primary/40 transition-colors flex flex-col relative overflow-hidden">
                    {sort === "score" && i < 3 && (
                      <div className="absolute top-2 right-2 size-8 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-xs font-bold text-primary-foreground glow-primary z-10">
                        #{i + 1}
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2 pr-8">
                      <h4 className="font-semibold text-sm leading-snug line-clamp-2">{p.title}</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {isOverpriced && (
                        <Badge className="bg-destructive/20 text-destructive border-destructive/40">
                          <ShieldAlert className="size-3 mr-1" /> Cảnh báo lừa đảo
                        </Badge>
                      )}
                      {isSuspiciouslyCheap && (
                        <Badge className="bg-warning/20 text-warning border-warning/40">
                          <AlertTriangle className="size-3 mr-1" /> Giá quá rẻ
                        </Badge>
                      )}
                      {isFair && (
                        <Badge className="bg-success/20 text-success border-success/40">
                          <ShieldCheck className="size-3 mr-1" /> Giá hợp lý
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">Match {p.score}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{p.district}</span>
                      <span className="inline-flex items-center gap-1"><Maximize2 className="size-3" />{p.area}m²</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="rounded-lg bg-foreground/5 border border-border p-2">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Giá đăng</div>
                        <div className={`font-bold ${isOverpriced ? "text-destructive" : isSuspiciouslyCheap ? "text-warning" : "text-foreground"}`}>
                          {(p.price / 1_000_000).toFixed(1)}tr
                        </div>
                      </div>
                      <div className="rounded-lg bg-primary/10 border border-primary/30 p-2">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Giá AI</div>
                        <div className="font-bold text-primary">{(p.aiPrice / 1_000_000).toFixed(1)}tr</div>
                      </div>
                    </div>
                    <div className="text-[11px] mb-3 flex items-center gap-1">
                      {diff >= 0 ? <TrendUp className="size-3 text-destructive" /> : <TrendingDown className="size-3 text-success" />}
                      <span className="text-muted-foreground">Chênh lệch:</span>
                      <span className={`font-mono ${Math.abs(diff) > p.aiPrice * 0.3 ? "text-destructive" : "text-foreground"}`}>
                        {diff >= 0 ? "+" : ""}{(diff / 1_000_000).toFixed(1)}tr ({((ratio - 1) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-24 -mx-2 mt-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={[
                          { k: "Vị trí", v: p.locationScore },
                          { k: "Giá", v: p.priceMatch },
                          { k: "Tiện ích", v: p.amenityScore },
                        ]}>
                          <PolarGrid stroke="var(--color-border)" />
                          <PolarAngleAxis dataKey="k" tick={{ fill: "var(--color-muted-foreground)", fontSize: 9 }} />
                          <Radar dataKey="v" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {ranked.length === 0 && (
          <Card className="glass-card p-12 text-center text-muted-foreground">
            Không có phòng nào phù hợp. Hãy nới lỏng bộ lọc.
          </Card>
        )}
      </div>
    </div>
  );
}
