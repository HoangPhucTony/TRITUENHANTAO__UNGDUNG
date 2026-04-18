import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Legend } from "recharts";
import { priceDistribution, areaDistribution, districtPrices, amenityImpact } from "@/lib/mockData";
import { Database, Filter, MapPin, Sparkles, Code2 } from "lucide-react";

export const Route = createFileRoute("/eda")({
  head: () => ({ meta: [{ title: "Phân tích Dữ liệu — SmartStay AI" }] }),
  component: EDAPage,
});

function StepHeader({ n, icon: Icon, title, subtitle }: { n: string; icon: any; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="shrink-0 h-12 w-12 rounded-xl bg-gradient-hero text-primary-foreground flex items-center justify-center shadow-glow">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-primary font-semibold">Bước {n}</div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay }}>
      {children}
    </motion.section>
  );
}

function EDAPage() {
  return (
    <div className="space-y-20">
      <header className="text-center max-w-3xl mx-auto">
        <Badge variant="secondary" className="mb-3">EDA Storytelling</Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Hành trình khám phá dữ liệu</h1>
        <p className="text-muted-foreground mt-4 text-lg">Từ <span className="font-mono">PhongTro.xlsx</span> hỗn loạn đến những insight có thể hành động.</p>
      </header>

      {/* STEP 1 */}
      <Section>
        <StepHeader n="01" icon={Filter} title="Tiền xử lý dữ liệu" subtitle="Làm sạch — chuẩn hoá — encode" />
        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="p-6 bg-gradient-card border-border/60">
            <h3 className="font-semibold mb-3">Thách thức dữ liệu thô</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary font-bold">›</span> ~18% giá trị thiếu ở cột "Tiện ích" và "Diện tích"</li>
              <li className="flex gap-2"><span className="text-primary font-bold">›</span> Outliers cực đoan: tin "ảo" giá 100tr/tháng</li>
              <li className="flex gap-2"><span className="text-primary font-bold">›</span> Vị trí biểu diễn dạng text tự do, cần chuẩn hoá</li>
              <li className="flex gap-2"><span className="text-primary font-bold">›</span> Tiện ích là tập multi-label cần encode</li>
            </ul>
          </Card>
          <Card className="p-6 bg-slate-950 text-slate-100 border-slate-800 font-mono text-xs leading-relaxed overflow-x-auto">
            <div className="flex items-center gap-2 mb-3 text-slate-400"><Code2 className="h-3.5 w-3.5" /> preprocessing.py</div>
            <pre className="whitespace-pre">
{`# Missing values
df['area'].fillna(df['area'].median(), inplace=True)
df['amenities'].fillna('none', inplace=True)

# Outlier removal (IQR)
Q1, Q3 = df['price'].quantile([.25, .75])
IQR = Q3 - Q1
df = df[(df.price >= Q1 - 1.5*IQR) & (df.price <= Q3 + 1.5*IQR)]

# Encoding & Scaling
df = pd.get_dummies(df, columns=['district'])
mlb = MultiLabelBinarizer()
amenities = mlb.fit_transform(df['amenities'].str.split(','))

scaler = StandardScaler()
df[['area', 'price']] = scaler.fit_transform(df[['area', 'price']])`}
            </pre>
          </Card>
        </div>
      </Section>

      {/* STEP 2 */}
      <Section>
        <StepHeader n="02" icon={Database} title="Phân bố Giá & Diện tích" subtitle="Thị trường tập trung ở phân khúc nào?" />
        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="p-6">
            <h3 className="font-semibold mb-1">Phân bố Giá thuê</h3>
            <p className="text-xs text-muted-foreground mb-4">Đơn vị: triệu VND/tháng</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--background)" }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-1">Phân bố Diện tích</h3>
            <p className="text-xs text-muted-foreground mb-4">Đơn vị: m²</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={areaDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--background)" }} />
                <Bar dataKey="count" fill="var(--primary-glow)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card className="p-6 mt-5 bg-primary/5 border-primary/20">
          <p className="text-sm leading-relaxed"><span className="font-semibold text-primary">📊 Insight:</span> Thị trường phòng trọ TP.HCM phục vụ chủ yếu <span className="font-semibold">sinh viên & người lao động trẻ</span>, với ngân sách phổ biến <span className="font-semibold">3–5 triệu VND</span> và diện tích <span className="font-semibold">25–35m²</span>. Phân khúc cao cấp (trên 10tr) chỉ chiếm ~3%.</p>
        </Card>
      </Section>

      {/* STEP 3 */}
      <Section>
        <StepHeader n="03" icon={MapPin} title="Mức giá theo Vị trí" subtitle="Khoảng cách giá giữa trung tâm và ngoại ô" />
        <Card className="p-6">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={districtPrices} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 12 }} unit=" tr" />
              <YAxis dataKey="district" type="category" tick={{ fontSize: 12 }} width={90} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--background)" }} />
              <Bar dataKey="price" fill="var(--primary)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6 mt-5 bg-primary/5 border-primary/20">
          <p className="text-sm leading-relaxed"><span className="font-semibold text-primary">📍 Insight:</span> Giá thuê ở <span className="font-semibold">Quận 1 (8.4tr) cao gấp ~2.9 lần</span> Bình Tân (2.9tr). Khoảng cách này phản ánh chi phí cơ hội lớn — và là <span className="font-semibold">cơ hội cho thuật toán gợi ý</span> đề xuất lựa chọn thay thế thông minh.</p>
        </Card>
      </Section>

      {/* STEP 4 */}
      <Section>
        <StepHeader n="04" icon={Sparkles} title="Ảnh hưởng của Tiện ích" subtitle="Tiện ích nào nâng giá thuê nhiều nhất?" />
        <div className="grid lg:grid-cols-5 gap-5">
          <Card className="p-6 lg:col-span-3">
            <ResponsiveContainer width="100%" height={360}>
              <RadarChart data={amenityImpact}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="amenity" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                <Radar name="Không có" dataKey="base" stroke="var(--muted-foreground)" fill="var(--muted-foreground)" fillOpacity={0.2} />
                <Radar name="Có tiện ích" dataKey="withAmenity" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.45} />
                <Legend />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--background)" }} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6 lg:col-span-2 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-3">Top tiện ích tăng giá</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between"><span>🛋️ Nội thất đầy đủ</span><span className="font-semibold text-primary">+58%</span></li>
              <li className="flex justify-between"><span>🛗 Thang máy</span><span className="font-semibold text-primary">+47%</span></li>
              <li className="flex justify-between"><span>❄️ Máy lạnh</span><span className="font-semibold text-primary">+37%</span></li>
              <li className="flex justify-between"><span>🌅 Ban công</span><span className="font-semibold text-primary">+30%</span></li>
              <li className="flex justify-between"><span>🛡️ Bảo vệ 24/7</span><span className="font-semibold text-primary">+25%</span></li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">Đây sẽ là những <span className="font-semibold">feature quan trọng</span> trong mô hình dự đoán giá ở bước tiếp theo.</p>
          </Card>
        </div>
      </Section>
    </div>
  );
}
