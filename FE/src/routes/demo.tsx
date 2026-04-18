import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { mockListings, districts } from "@/lib/mockData";
import { Search, ShieldCheck, ShieldAlert, MapPin, Lightbulb, Flame } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const districtCoordinates: Record<string, [number, number]> = {
  "Quận 1": [10.7769, 106.7009],
  "Quận 3": [10.7843, 106.6816],
  "Quận 10": [10.7743, 106.6669],
  "Bình Thạnh": [10.8105, 106.7091],
  "Phú Nhuận": [10.7984, 106.6806],
  "Tân Bình": [10.8015, 106.6526],
  "Gò Vấp": [10.8386, 106.6659],
  "Quận 7": [10.7334, 106.7265],
  "Thủ Đức": [10.8494, 106.7537],
  "Bình Tân": [10.7653, 106.6033],
};
export const Route = createFileRoute("/demo")({
  head: () => ({ meta: [{ title: "Web Demo — SmartStay AI" }] }),
  component: DemoPage,
});

function DemoPage() {
  const [budget, setBudget] = useState([5]);
  const [district, setDistrict] = useState("Tất cả");
  const [nearSchool, setNearSchool] = useState(true);
  const [nearHospital, setNearHospital] = useState(false);
  const [avoidLandslide, setAvoidLandslide] = useState(true);
  const [avoidFlood, setAvoidFlood] = useState(true);
  const [avoidMigration, setAvoidMigration] = useState(false);
  const [compareMarket, setCompareMarket] = useState(false);

  const tradeoff = useMemo(() => {
    if (district === "Quận 1" && budget[0] < 6) {
      return { from: "Quận 1", to: "Bình Thạnh", budget: budget[0] };
    }
    if (district === "Quận 3" && budget[0] < 5.5) {
      return { from: "Quận 3", to: "Phú Nhuận", budget: budget[0] };
    }
    return null;
  }, [budget, district]);

  const filtered = useMemo(() => {
    return mockListings.filter(l => l.listedPrice <= budget[0] + 1.5)
      .filter(l => district === "Tất cả" || l.district === district);
  }, [budget, district]);

  return (
    <div className="space-y-8">
      <header className="text-center max-w-3xl mx-auto">
        <Badge variant="secondary" className="mb-3"><Search className="h-3 w-3 mr-1" /> MVP Demo</Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Tìm phòng trọ thông minh</h1>
        <p className="text-muted-foreground mt-4 text-lg">Gợi ý cá nhân hoá + cảnh báo lừa đảo + phân tích đánh đổi.</p>
      </header>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* FILTERS */}
        <Card className="p-6 lg:col-span-1 h-fit lg:sticky lg:top-24 space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Bộ lọc</h3>
            <div className="flex justify-between mb-2">
              <Label>Ngân sách</Label>
              <span className="text-sm font-semibold text-primary">{budget[0]} tr</span>
            </div>
            <Slider value={budget} onValueChange={setBudget} min={1} max={15} step={0.5} />
          </div>
          <div>
            <Label className="mb-2 block">Khu vực</Label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tất cả">Tất cả khu vực</SelectItem>
                {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3 pt-4 border-t border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Dữ liệu ngoài</p>
            {[
              { l: "🏫 Gần trường THPT", v: nearSchool, s: setNearSchool },
              { l: "🏥 Gần Bệnh viện", v: nearHospital, s: setNearHospital },
              { l: "⚠️ Tránh khu cảnh báo sạt lở", v: avoidLandslide, s: setAvoidLandslide },
              { l: "🌊 Tránh khu ngập / triều cường", v: avoidFlood, s: setAvoidFlood },
              { l: "🚚 Khu vực dự kiến di dân", v: avoidMigration, s: setAvoidMigration },
              { l: "📊 Đối chiếu thị trường (Chợ Tốt)", v: compareMarket, s: setCompareMarket },
            ].map(t => (
              <div key={t.l} className="flex items-center justify-between gap-2">
                <Label className="text-sm font-normal cursor-pointer">{t.l}</Label>
                <Switch checked={t.v} onCheckedChange={t.s} />
              </div>
            ))}
          </div>
        </Card>

        {/* MAIN */}
        <div className="lg:col-span-3 space-y-5">
          {tradeoff && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert className="border-primary/40 bg-primary/5">
                <Lightbulb className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Gợi ý thông minh — Phân tích đánh đổi</AlertTitle>
                <AlertDescription>
                  Với ngân sách <span className="font-semibold">{tradeoff.budget} triệu</span>, bạn không thể thuê ở <span className="font-semibold">{tradeoff.from}</span>. AI đề xuất chuyển sang <span className="font-semibold">{tradeoff.to}</span> (cách ~3km) — chất lượng tương đương, tiết kiệm ~30%.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Interactive Map */}
          <Card className="p-6 overflow-hidden relative">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Bản đồ Phân Bổ Giá Cả</h3>
                <p className="text-xs text-muted-foreground mt-1">Khám phá vị trí phòng trọ trực quan trên toàn thành phố</p>
              </div>
              <Badge variant="outline" className="text-[10px]">Live</Badge>
            </div>
            <div className="relative h-64 rounded-xl overflow-hidden z-0 border border-border">
              {typeof window !== 'undefined' && (
                <MapContainer center={[10.7769, 106.7009]} zoom={12} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  {filtered.map((l, i) => {
                    const coords = districtCoordinates[l.district] || [10.7769, 106.7009];
                    // small random-like offset to spread out markers in the same district
                    const lat = coords[0] + (i * 0.004) * (i % 2 === 0 ? 1 : -1);
                    const lng = coords[1] + (i * 0.004) * (i % 3 === 0 ? 1 : -1);
                    const isScam = l.listedPrice < l.aiPrice * 0.6;
                    const color = isScam ? "#ef4444" : "#10b981"; // red/green
                    return (
                      <CircleMarker key={l.id} center={[lat, lng]} radius={8} pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 1 }}>
                        <Popup>
                          <div className="text-sm min-w-[150px]">
                            <div className="font-semibold line-clamp-1">{l.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">{l.district}</div>
                            <div className="mt-2 flex justify-between">
                              <span className="font-medium text-destructive">{l.listedPrice}tr</span>
                              <span className="text-xs text-muted-foreground">AI: {l.aiPrice}tr</span>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              )}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> Giá an toàn</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> Cảnh báo giá quá rẻ</div>
            </div>
          </Card>

          {/* Listings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Gợi ý cho bạn <span className="text-muted-foreground font-normal">({filtered.length} kết quả)</span></h3>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {filtered.map((l, i) => {
                const isScam = l.listedPrice < l.aiPrice * 0.6;
                const confidence = isScam ? 88 : 95;
                const radarData = [
                  { axis: "Vị trí", value: l.scores.location },
                  { axis: "Giá", value: l.scores.price },
                  { axis: "Tiện ích", value: l.scores.amenities },
                ];
                return (
                  <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="overflow-hidden group hover:shadow-elegant transition-all hover:-translate-y-1 h-full flex flex-col">
                      <div className="relative h-40 overflow-hidden bg-muted">
                        <img src={l.image} alt={l.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 left-3">
                          {isScam ? (
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Badge className="bg-destructive text-destructive-foreground border-0 shadow-lg cursor-help">
                                  <ShieldAlert className="h-3 w-3 mr-1" /> Cảnh báo lừa đảo
                                </Badge>
                              </HoverCardTrigger>
                              <HoverCardContent align="start" className="w-64 text-sm z-[100]">
                                <p className="font-semibold text-destructive mb-1">Dấu hiệu bất thường!</p>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                  Giá đăng <strong>{l.listedPrice} triệu</strong> thấp hơn đáng kể so với định giá của AI <strong>({l.aiPrice} triệu)</strong>.
                                  Khu vực {l.district} hiếm có mức giá này với tiện ích tương đương. Vui lòng cẩn thận xác minh!
                                </p>
                              </HoverCardContent>
                            </HoverCard>
                          ) : (
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Badge className="bg-success text-success-foreground border-0 shadow-lg cursor-help">
                                  <ShieldCheck className="h-3 w-3 mr-1" /> Giá hợp lý
                                </Badge>
                              </HoverCardTrigger>
                              <HoverCardContent align="start" className="w-64 text-sm z-[100]">
                                <p className="font-semibold text-success mb-1">Giá an toàn</p>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                  Giá đăng <strong>{l.listedPrice} triệu</strong> nằm trong khoảng an toàn so với định giá của AI <strong>({l.aiPrice} triệu)</strong> dựa trên thuật toán XGBoost.
                                </p>
                              </HoverCardContent>
                            </HoverCard>
                          )}
                        </div>
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded-md">
                          AI Confidence: {confidence}%
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="font-semibold leading-snug line-clamp-1">{l.title}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" /> {l.district} · {l.area}m²
                        </div>
                        <div className="flex items-end justify-between mt-3 mb-2">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Giá đăng</div>
                            <div className={`text-2xl font-bold ${isScam ? "text-destructive" : "text-foreground"}`}>{l.listedPrice}<span className="text-xs text-muted-foreground ml-1">tr</span></div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">AI dự đoán</div>
                            <div className="text-base font-semibold text-primary">{l.aiPrice}<span className="text-xs text-muted-foreground ml-1">tr</span></div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {l.amenities.map(a => <Badge key={a} variant="outline" className="text-[10px] font-normal">{a}</Badge>)}
                        </div>
                        <div className="mt-auto -mx-2 -mb-2">
                          <ResponsiveContainer width="100%" height={130}>
                            <RadarChart data={radarData} outerRadius={45}>
                              <PolarGrid stroke="hsl(var(--border))" />
                              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} />
                              <Radar dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.45} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <Card className="p-10 text-center text-muted-foreground">Không có kết quả phù hợp. Thử nới ngân sách hoặc đổi khu vực.</Card>
            )}
          </div>
        </div>
      </div>
      <ChatbotWidget
        onApplyFilters={(filters) => {
          if (filters.district) setDistrict(filters.district);
          if (filters.maxBudget) setBudget([filters.maxBudget]);
        }}
      />
    </div>
  );
}
