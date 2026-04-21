import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  Droplets,
  Hospital,
  Lightbulb,
  Loader2,
  Map,
  MapPin,
  Maximize2,
  School,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { type Property } from "@/features/data/mockData";
import {
  type DesiredLocation,
  formatDistanceKm,
  haversineDistanceKm,
  LOCATION_OPTIONS,
} from "@/features/demo/data/locationOptions";
import { api, type DistrictDto, type GeocodeSuggestionDto, type PropertyTypeDto } from "@/lib/api";
import { LocationPicker } from "./LocationPicker";
import { PropertyMap } from "./PropertyMap";

type SortKey = "score" | "price" | "amenities";

type RankedProperty = Property & {
  score: number;
  priceMatch: number;
  locationScore: number;
  amenityScore: number;
  contextScore: number;
  distanceKm: number | null;
  withinPreferredRadius: boolean;
};

const PREMIUM_DISTRICTS = ["Quận 1", "Quận 3", "Quận 10", "Bình Thạnh", "Phú Nhuận"];
const MODEL_LABELS: Record<string, string> = {
  linear: "Linear Regression",
  tree: "Decision Tree",
  knn: "KNN",
  rf: "Random Forest",
  xgb: "XGBoost",
  ensemble: "Ensemble RF + XGB + KNN",
};

export function DemoExperience() {
  const [budget, setBudget] = useState(6);
  const [preferredRadiusKm, setPreferredRadiusKm] = useState(2.5);
  const [nearSchool, setNearSchool] = useState(false);
  const [nearHospital, setNearHospital] = useState(false);
  const [floodSafe, setFloodSafe] = useState(true);
  const [avoidDanger, setAvoidDanger] = useState(true);
  const [sort, setSort] = useState<SortKey>("score");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedPropertyType, setSelectedPropertyType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState<DesiredLocation | null>(null);
  const [mapSelectionEnabled, setMapSelectionEnabled] = useState(false);

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["properties-all"],
    queryFn: () => api.getProperties({ limit: 2000 }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: districts = [] } = useQuery<DistrictDto[]>({
    queryKey: ["districts"],
    queryFn: () => api.getDistricts(),
  });

  const { data: propertyTypes = [] } = useQuery<PropertyTypeDto[]>({
    queryKey: ["property-types"],
    queryFn: () => api.getPropertyTypes(),
  });

  const selectedDistrictSummary = useMemo(
    () => districts.find((district) => district.name === selectedDistrict) ?? null,
    [districts, selectedDistrict],
  );

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (property.price > budget * 1_000_000) {
        return false;
      }
      if (selectedDistrict !== "all" && property.district !== selectedDistrict) {
        return false;
      }
      if (
        selectedPropertyType !== "all" &&
        property.propertyTypeKey !== selectedPropertyType &&
        property.propertyType !== selectedPropertyType
      ) {
        return false;
      }
      if (nearSchool && !property.nearSchool) {
        return false;
      }
      if (nearHospital && !property.nearHospital) {
        return false;
      }
      if (floodSafe && !property.floodSafe) {
        return false;
      }
      if (avoidDanger && property.dangerZone) {
        return false;
      }
      return true;
    });
  }, [avoidDanger, budget, floodSafe, nearHospital, nearSchool, properties, selectedDistrict, selectedPropertyType]);

  const ranked = useMemo<RankedProperty[]>(() => {
    const processed = filteredProperties.map((property) => {
      const safeAiPrice = property.aiPrice > 0 ? property.aiPrice : property.price;
      const listedPriceInMillions = property.price / 1_000_000;
      const affordabilityRatio = Math.max(0, Math.min(1, (budget - listedPriceInMillions) / Math.max(budget, 0.1)));
      const fairnessGapRatio = Math.abs(property.price - safeAiPrice) / Math.max(safeAiPrice, 1);
      const fairnessScore = Math.max(35, Math.round(100 - fairnessGapRatio * 120));
      const affordabilityScore = Math.round(70 + affordabilityRatio * 30);
      const priceMatch = Math.round(fairnessScore * 0.65 + affordabilityScore * 0.35);
      const amenityScore = Math.min(100, 24 + (property.amenities?.length || 0) * 12);

      const distanceKm = selectedLocation
        ? haversineDistanceKm(selectedLocation, { lat: property.lat, lng: property.lng })
        : null;

      const withinPreferredRadius = distanceKm !== null && distanceKm <= preferredRadiusKm;
      const districtBoost =
        selectedDistrict !== "all" && property.district === selectedDistrict
          ? 94
          : PREMIUM_DISTRICTS.includes(property.district)
            ? 88
            : 68;
      const locationScore =
        distanceKm === null
          ? districtBoost
          : Math.max(
              12,
              Math.round(100 - Math.min(distanceKm, preferredRadiusKm * 3) * (85 / (preferredRadiusKm * 3))),
            );

      const contextScore = property.environmentScore;
      const score = Math.round(
        priceMatch * 0.32 + locationScore * 0.28 + amenityScore * 0.15 + contextScore * 0.25,
      );

      return {
        ...property,
        score,
        priceMatch,
        locationScore,
        amenityScore,
        contextScore,
        distanceKm,
        withinPreferredRadius,
      };
    });

    if (sort === "price") {
      return [...processed].sort((a, b) => a.price - b.price);
    }

    if (sort === "amenities") {
      return [...processed].sort((a, b) => (b.amenities?.length || 0) - (a.amenities?.length || 0));
    }

    return [...processed].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (selectedLocation && a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return a.price - b.price;
    });
  }, [budget, filteredProperties, preferredRadiusKm, selectedDistrict, selectedLocation, sort]);

  const locationAwareShortlist = useMemo(() => {
    if (!selectedLocation) {
      return ranked.slice(0, 12);
    }

    return [...ranked]
      .sort((a, b) => {
        if (a.withinPreferredRadius !== b.withinPreferredRadius) {
          return a.withinPreferredRadius ? -1 : 1;
        }
        const aDistance = a.distanceKm ?? Number.POSITIVE_INFINITY;
        const bDistance = b.distanceKm ?? Number.POSITIVE_INFINITY;
        if (aDistance !== bDistance) {
          return aDistance - bDistance;
        }
        return b.score - a.score;
      })
      .slice(0, 12);
  }, [ranked, selectedLocation]);

  const affordableDistricts = useMemo(() => {
    return districts
      .filter((district) => district.avg_price / 1_000_000 <= budget + 0.5)
      .filter((district) => district.name !== selectedLocation?.district)
      .filter((district) => district.name !== selectedDistrict)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((district) => district.name);
  }, [budget, districts, selectedDistrict, selectedLocation?.district]);

  const activeModelKey = ranked[0]?.aiModelKey ?? properties[0]?.aiModelKey ?? "ensemble";
  const activeModelLabel = MODEL_LABELS[activeModelKey] ?? activeModelKey;

  const selectedPropertyTypeLabel =
    selectedPropertyType === "all"
      ? "Tất cả loại phòng"
      : propertyTypes.find((type) => type.key === selectedPropertyType)?.name ?? selectedPropertyType;

  const showBudgetAlert =
    !!selectedLocation &&
    budget < 4.5 &&
    PREMIUM_DISTRICTS.includes(selectedLocation.district) &&
    affordableDistricts.length > 0;

  function handleEnableMapSelection() {
    setMapSelectionEnabled((current) => {
      const next = !current;
      toast.message(next ? "Bấm vào bản đồ để đặt vị trí ưu tiên." : "Đã tắt chế độ chọn vị trí trên bản đồ.");
      return next;
    });
  }

  function handleMapLocationSelect(coords: { lat: number; lng: number }) {
    const nearestProperty = properties.reduce<Property | null>((closest, property) => {
      if (!closest) {
        return property;
      }
      const closestDistance = haversineDistanceKm(coords, { lat: closest.lat, lng: closest.lng });
      const propertyDistance = haversineDistanceKm(coords, { lat: property.lat, lng: property.lng });
      return propertyDistance < closestDistance ? property : closest;
    }, null);

    setSelectedLocation({
      id: `custom-${coords.lat.toFixed(5)}-${coords.lng.toFixed(5)}`,
      name: "Điểm đã chọn trên bản đồ",
      address: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
      district: nearestProperty?.district ?? selectedDistrictSummary?.name ?? "TP.HCM",
      lat: coords.lat,
      lng: coords.lng,
      category: "custom",
      source: "map",
      keywords: [],
    });
    setMapSelectionEnabled(false);
    toast.success("Đã cập nhật vị trí ưu tiên từ bản đồ.");
  }

  async function handleSearchAddress(query: string) {
    const suggestions = await api.searchAddress(query);
    return suggestions.map(mapGeocodeSuggestionToLocation);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="glass-card h-fit space-y-6 p-6 lg:sticky lg:top-6">
        <div>
          <h3 className="mb-1 font-semibold">Bộ lọc thông minh</h3>
          <p className="text-xs text-muted-foreground">
            Chọn quận, loại phòng, địa điểm mong muốn và để hệ thống lọc theo dữ liệu thực từ listing cùng các yếu tố môi trường.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Ngân sách tối đa</Label>
            <span className="text-sm font-semibold text-primary">{budget} triệu</span>
          </div>
          <Slider value={[budget]} onValueChange={(value) => setBudget(value[0])} min={2} max={12} step={0.5} />
          <p className="text-[11px] text-muted-foreground">
            Chỉ hiển thị phòng có giá đăng nhỏ hơn hoặc bằng mức này.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Lọc theo quận</Label>
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn quận / huyện" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả quận / huyện</SelectItem>
              {districts.map((district) => (
                <SelectItem key={district.name} value={district.name}>
                  {district.name} ({district.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDistrictSummary && (
            <div className="rounded-lg border border-border/60 bg-foreground/5 p-3 text-[11px] text-muted-foreground">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                <Building2 className="size-3.5 text-primary" />
                {selectedDistrictSummary.name}
              </div>
              <div>
                Giá trung bình: {(selectedDistrictSummary.avg_price / 1_000_000).toFixed(1)}tr · {selectedDistrictSummary.count} tin
              </div>
              <div>
                {selectedDistrictSummary.schoolCount} THPT · {selectedDistrictSummary.hospitalCount} CSYT · Điểm bối cảnh{" "}
                {selectedDistrictSummary.environmentScore}/100
              </div>
              {selectedDistrictSummary.districtRentBenchmark > 0 && (
                <div>Benchmark thuê quận: {(selectedDistrictSummary.districtRentBenchmark / 1_000_000).toFixed(1)}tr</div>
              )}
              {selectedDistrictSummary.contextNotes.slice(0, 2).map((note) => (
                <div key={note}>{note}</div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Loại phòng</Label>
          <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại phòng</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type.key} value={type.key}>
                  {type.name} ({type.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-[11px] text-muted-foreground">
            Lấy trực tiếp từ cột `property_type_clean / phanloai` trong dataset đã làm sạch.
          </div>
        </div>

        <LocationPicker
          options={LOCATION_OPTIONS}
          selectedLocation={selectedLocation}
          onSelectLocation={(location) => {
            setSelectedLocation(location);
            setMapSelectionEnabled(false);
          }}
          onClearLocation={() => {
            setSelectedLocation(null);
            setMapSelectionEnabled(false);
          }}
          onEnableMapSelection={handleEnableMapSelection}
          isMapSelectionEnabled={mapSelectionEnabled}
          onSearchAddress={handleSearchAddress}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Bán kính ưu tiên</Label>
            <span className="text-sm font-semibold text-primary">{preferredRadiusKm.toFixed(1)} km</span>
          </div>
          <Slider
            value={[preferredRadiusKm]}
            onValueChange={(value) => setPreferredRadiusKm(value[0])}
            min={0.5}
            max={6}
            step={0.5}
          />
          <p className="text-[11px] text-muted-foreground">
            Khi đã chọn địa điểm thật, các phòng trong phạm vi này sẽ được ưu tiên hơn.
          </p>
        </div>

        <div className="space-y-2">
          {[
            { label: "Ưu tiên quận có nhiều THPT", checked: nearSchool, setChecked: setNearSchool, icon: School },
            {
              label: "Ưu tiên quận có nhiều cơ sở y tế",
              checked: nearHospital,
              setChecked: setNearHospital,
              icon: Hospital,
            },
            { label: "Hạn chế vùng ngập", checked: floodSafe, setChecked: setFloodSafe, icon: Droplets },
            {
              label: "Loại trừ khu có cảnh báo rủi ro",
              checked: avoidDanger,
              setChecked: setAvoidDanger,
              icon: AlertTriangle,
            },
          ].map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.label}
                className="flex items-center justify-between rounded-lg border border-border bg-foreground/5 px-3 py-2.5"
              >
                <Label className="flex items-center gap-2 text-sm">
                  <Icon className="size-3.5 text-muted-foreground" />
                  {option.label}
                </Label>
                <Switch checked={option.checked} onCheckedChange={option.setChecked} />
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Sắp xếp theo</Label>
          <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Điểm match</SelectItem>
              <SelectItem value="price">Giá đăng tăng dần</SelectItem>
              <SelectItem value="amenities">Tiện ích giảm dần</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-center">
          <div className="text-2xl font-bold text-gradient">{ranked.length}</div>
          <div className="text-xs text-muted-foreground">Phòng phù hợp sau khi lọc</div>
        </div>
      </Card>

      <div className="space-y-4">
        <Alert className="border-primary/30 bg-primary/10">
          <ShieldCheck className="size-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Định giá AI:</strong> {activeModelLabel}. <strong>Đang lọc:</strong> {selectedPropertyTypeLabel}{" "}
            {selectedDistrict !== "all" ? `tại ${selectedDistrict}` : "trên toàn bộ quận/huyện"}.
          </AlertDescription>
        </Alert>

        <AnimatePresence>
          {mapSelectionEnabled && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Alert className="border-primary/30 bg-primary/10">
                <MapPin className="size-4 text-primary" />
                <AlertDescription className="text-foreground">
                  Bấm vào bản đồ để đặt vị trí ưu tiên. Sau đó hệ thống sẽ tính khoảng cách thật cho từng phòng.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {showBudgetAlert && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Alert className="border-warning/40 bg-warning/10">
                <Lightbulb className="size-4 text-warning" />
                <AlertDescription className="text-foreground">
                  <strong>Gợi ý ngân sách:</strong> khu vực <strong>{selectedLocation?.district}</strong> khá căng với{" "}
                  <strong>{budget} triệu</strong>. Bạn có thể cân nhắc <strong>{affordableDistricts.slice(0, 3).join(", ")}</strong>.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="glass-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Map className="size-4 text-primary" />
              <span className="text-sm font-semibold">Bản đồ vị trí</span>
              <Badge variant="outline" className="text-[10px]">
                {ranked.length} phòng
              </Badge>
              {selectedLocation && (
                <Badge variant="outline" className="border-primary/30 text-[10px] text-primary">
                  Ưu tiên quanh {selectedLocation.name}
                </Badge>
              )}
            </div>
            {isLoading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          </div>
          <div className="px-4 pb-4">
            <PropertyMap
              properties={locationAwareShortlist}
              selectedLocation={selectedLocation}
              preferredRadiusKm={preferredRadiusKm}
              mapSelectionEnabled={mapSelectionEnabled}
              onSelectLocation={handleMapLocationSelect}
            />
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="glass-card flex h-[380px] flex-col gap-4 p-4">
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
            {!isLoading &&
              locationAwareShortlist.map((property, index) => {
                const safeAiPrice = property.aiPrice > 0 ? property.aiPrice : property.price;
                const ratio = property.price / safeAiPrice;
                const isHighVsAi = ratio > 1.25;
                const needsVerification = ratio < 0.65;
                const isFair = !isHighVsAi && !needsVerification;
                const diff = property.price - safeAiPrice;

                return (
                  <motion.div
                    key={property.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="glass-card relative flex h-full flex-col overflow-hidden p-4 transition-colors hover:border-primary/40">
                      {sort === "score" && index < 3 && (
                        <div className="glow-primary absolute top-2 right-2 z-10 grid size-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
                          #{index + 1}
                        </div>
                      )}

                      <div className="mb-2 flex items-start justify-between gap-2 pr-8">
                        <h4 className="line-clamp-2 text-sm leading-snug font-semibold">{property.title}</h4>
                      </div>

                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {property.propertyType}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {property.areaGroup}
                        </Badge>
                        {isHighVsAi && (
                          <Badge className="border-destructive/40 bg-destructive/20 text-destructive">
                            <ShieldAlert className="mr-1 size-3" />
                            Giá cao hơn AI
                          </Badge>
                        )}
                        {needsVerification && (
                          <Badge className="border-warning/40 bg-warning/20 text-warning">
                            <AlertTriangle className="mr-1 size-3" />
                            Cần kiểm tra thêm
                          </Badge>
                        )}
                        {isFair && (
                          <Badge className="border-success/40 bg-success/20 text-success">
                            <ShieldCheck className="mr-1 size-3" />
                            Giá hợp lý
                          </Badge>
                        )}
                        {property.withinPreferredRadius && (
                          <Badge variant="outline" className="border-primary/30 text-[10px] text-primary">
                            Trong bán kính
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px]">
                          Match {property.score}
                        </Badge>
                      </div>

                      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" />
                          {property.district}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Maximize2 className="size-3" />
                          {property.area}m²
                        </span>
                        {selectedLocation && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" />
                            {formatDistanceKm(property.distanceKm)}
                          </span>
                        )}
                      </div>

                      <div className="mb-2 grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-border bg-foreground/5 p-2">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Giá đăng</div>
                          <div
                            className={`font-bold ${
                              isHighVsAi
                                ? "text-destructive"
                                : needsVerification
                                  ? "text-warning"
                                  : "text-foreground"
                            }`}
                          >
                            {(property.price / 1_000_000).toFixed(1)}tr
                          </div>
                          <div className="text-[10px] text-muted-foreground">{property.priceGroup}</div>
                        </div>
                        <div className="rounded-lg border border-primary/30 bg-primary/10 p-2">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Giá AI</div>
                          <div className="font-bold text-primary">{(safeAiPrice / 1_000_000).toFixed(1)}tr</div>
                          <div className="text-[10px] text-muted-foreground">
                            {MODEL_LABELS[property.aiModelKey] ?? property.aiModelKey}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3 flex items-center gap-1 text-[11px]">
                        {diff >= 0 ? (
                          <TrendingUp className="size-3 text-destructive" />
                        ) : (
                          <TrendingDown className="size-3 text-success" />
                        )}
                        <span className="text-muted-foreground">Chênh lệch:</span>
                        <span
                          className={`font-mono ${
                            Math.abs(diff) > safeAiPrice * 0.3 ? "text-destructive" : "text-foreground"
                          }`}
                        >
                          {diff >= 0 ? "+" : ""}
                          {(diff / 1_000_000).toFixed(1)}tr ({((ratio - 1) * 100).toFixed(0)}%)
                        </span>
                      </div>

                      <div className="mb-3 rounded-lg border border-border/60 bg-foreground/5 p-2 text-[11px] text-muted-foreground">
                        <div className="mb-1 font-medium text-foreground">Bối cảnh quận</div>
                        <div>
                          {property.schoolCount} THPT · {property.hospitalCount} CSYT · Điểm bối cảnh {property.contextScore}/100
                        </div>
                        {property.districtRentBenchmark > 0 && (
                          <div>Benchmark thuê quận: {(property.districtRentBenchmark / 1_000_000).toFixed(1)}tr</div>
                        )}
                        {property.contextNotes.slice(0, 2).map((note) => (
                          <div key={note}>{note}</div>
                        ))}
                      </div>

                      <div className="mt-auto h-24 -mx-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            data={[
                              { key: "Khoảng cách", value: property.locationScore },
                              { key: "Giá", value: property.priceMatch },
                              { key: "Tiện ích", value: property.amenityScore },
                              { key: "Bối cảnh", value: property.contextScore },
                            ]}
                          >
                            <PolarGrid stroke="var(--color-border)" />
                            <PolarAngleAxis dataKey="key" tick={{ fill: "var(--color-muted-foreground)", fontSize: 9 }} />
                            <Radar dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>

        {!isLoading && ranked.length === 0 && (
          <Card className="glass-card p-12 text-center text-muted-foreground">
            Không có phòng nào phù hợp với bộ lọc hiện tại. Hãy nới ngân sách hoặc đổi quận / loại phòng.
          </Card>
        )}
      </div>
    </div>
  );
}

function mapGeocodeSuggestionToLocation(suggestion: GeocodeSuggestionDto): DesiredLocation {
  return {
    id: `remote-${suggestion.lat.toFixed(5)}-${suggestion.lng.toFixed(5)}`,
    name: suggestion.name,
    address: suggestion.address,
    district: suggestion.district,
    lat: suggestion.lat,
    lng: suggestion.lng,
    category: "custom",
    source: suggestion.source,
    keywords: [],
  };
}
