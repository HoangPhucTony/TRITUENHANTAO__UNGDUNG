import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const anim = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

interface StepProps {
  step: number;
  badge: string;
  title: string;
  what: string;
  why: string;
  insight: React.ReactNode;
  conclusion: string;
  children: React.ReactNode;
  wide?: boolean;
}

function EDAStep({ step, badge, title, what, why, insight, conclusion, children, wide }: StepProps) {
  return (
    <motion.section {...anim} className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center font-bold text-primary-foreground shrink-0 text-sm">
          {step}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold">{title}</h2>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{badge}</Badge>
          </div>
        </div>
      </div>

      <Card className="glass-card overflow-hidden">
        {/* Chart area */}
        <div className={`${wide ? "p-2" : "p-4"} border-b border-border bg-foreground/[0.02]`}>
          {children}
        </div>

        {/* Explanation */}
        <div className="p-5 grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1.5">📋 Đã làm gì</div>
            <p className="text-muted-foreground leading-relaxed">{what}</p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1.5">💡 Tại sao</div>
            <p className="text-muted-foreground leading-relaxed">{why}</p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1.5">🔍 Insight</div>
            <div className="text-muted-foreground leading-relaxed">{insight}</div>
          </div>
        </div>
        <div className="px-5 pb-4">
          <div className="rounded-lg bg-primary/8 border border-primary/20 px-4 py-2.5 text-sm">
            <span className="font-semibold text-primary">→ Kết luận: </span>
            <span className="text-foreground/80">{conclusion}</span>
          </div>
        </div>
      </Card>
    </motion.section>
  );
}

function ChartImg({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
        <img
          src={src}
          alt={alt}
          className="w-full object-contain max-h-[480px] block"
          style={{ background: "#ffffff" }}
        />
      </div>
      {caption && (
        <p className="text-[11px] text-center text-muted-foreground italic px-2">{caption}</p>
      )}
    </div>
  );
}

function TwoCol({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

export function EDAStory() {
  return (
    <div className="space-y-14">

      {/* STEP 1 — Dataset overview */}
      <EDAStep
        step={1}
        badge="Dataset Overview"
        title="Tổng quan dữ liệu thô"
        what="Load file PhongTro.xlsx, kiểm tra shape, kiểu dữ liệu, các cột và 5 dòng đầu. Xác định biến mục tiêu (price_vnd) và các feature đầu vào."
        why="Bước bắt buộc đầu tiên để hiểu 'bản đồ' dữ liệu — biết mình có gì, dạng gì, quy mô bao nhiêu trước khi làm bất cứ điều gì."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• <strong>10 loại hình</strong> BĐS khác nhau: Phòng trọ chiếm đa số (≈35%), tiếp theo Nhà nguyên căn, Căn hộ chung cư</li>
            <li>• <strong>23+ quận/huyện</strong> toàn TP.HCM — phủ từ trung tâm đến ngoại thành</li>
            <li>• Giá dao động <strong>700k – 100tr/tháng</strong> — cần xử lý outlier ngay</li>
          </ul>
        }
        conclusion="Dataset đủ đa dạng để huấn luyện mô hình, nhưng cần tiền xử lý kỹ trước khi dùng."
      >
        <TwoCol
          left={<ChartImg src="/figures/listing_count_by_type.png" alt="Số lượng tin theo loại hình" caption="Số lượng tin đăng theo từng loại hình BĐS" />}
          right={<ChartImg src="/figures/listing_count_by_location.png" alt="Số lượng tin theo vị trí" caption="Phân bố tin đăng theo quận/huyện" />}
        />
      </EDAStep>

      {/* STEP 2 — Missing values */}
      <EDAStep
        step={2}
        badge="Missing Values"
        title="Phát hiện & xử lý giá trị thiếu"
        what="Quét toàn bộ dataset, đếm tỷ lệ NaN theo cột. Cột số (price, area) điền bằng median theo nhóm quận + loại hình. Cột nhị phân (tiện ích) điền bằng mode."
        why="Tin đăng phòng trọ thường thiếu thông tin tiện ích do người đăng không khai đầy đủ. Nếu xoá dòng thiếu sẽ mất 35%+ dữ liệu — không chấp nhận được. Median chống outlier tốt hơn mean."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• Tiện ích (nội thất, thang máy, ban công) thiếu <strong>15–22%</strong> — nhiều nhất</li>
            <li>• Giá và diện tích gần như đầy đủ vì là trường bắt buộc khi đăng tin</li>
            <li>• Sau xử lý: <strong>100%</strong> dữ liệu được giữ lại</li>
          </ul>
        }
        conclusion="Chiến lược điền median/mode theo nhóm cho kết quả tốt hơn điền toàn dataset, giữ được tính đặc thù của từng khu vực."
      >
        <ChartImg src="/figures/price_area_price_per_m2_distribution.png" alt="Phân phối giá, diện tích, giá/m²" caption="Phân phối của 3 biến số chính trước và sau xử lý" />
      </EDAStep>

      {/* STEP 3 — Outliers */}
      <EDAStep
        step={3}
        badge="Outlier Detection"
        title="Phát hiện & loại bỏ ngoại lai"
        what="Áp dụng IQR method: tính Q1, Q3 cho price_vnd và area_m2. Loại điểm nằm ngoài [Q1 − 1.5×IQR, Q3 + 1.5×IQR]. Scatter plot trực quan hoá outlier."
        why="Boxplot cho thấy rõ các điểm giá >25tr (căn hộ cao cấp lẫn lộn) và <1tr (tin câu like/scam). Nếu giữ, Linear Regression sẽ bị kéo lệch nghiêm trọng."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• Các vòng tròn rỗng trong boxplot là <strong>outlier</strong> thực sự cần loại</li>
            <li>• Quận 8 và Bình Thạnh có outlier cao bất thường — có thể là Nhà nguyên căn bị phân loại nhầm vào Phòng trọ</li>
            <li>• Scatter area vs price: trend tuyến tính rõ ràng sau khi bỏ ngoại lai</li>
          </ul>
        }
        conclusion="Loại ~5% dữ liệu nhưng chất lượng tăng đáng kể. Dataset còn lại đại diện chính xác cho thị trường thực tế."
      >
        <TwoCol
          left={<ChartImg src="/figures/boxplot_price_by_location.png" alt="Boxplot giá theo vị trí" caption="Boxplot giá thuê theo quận — thấy rõ outlier" />}
          right={<ChartImg src="/figures/area_vs_price_scatter.png" alt="Scatter area vs price" caption="Scatter plot: mối quan hệ diện tích–giá theo loại hình" />}
        />
      </EDAStep>

      {/* STEP 4 — Price distribution */}
      <EDAStep
        step={4}
        badge="Distribution Analysis"
        title="Phân tích phân phối giá & diện tích"
        what="Vẽ histogram + KDE cho price_vnd, area_m2, price_per_m2. Tính skewness, kurtosis. So sánh giữa các nhóm loại hình."
        why="Phân phối quyết định kỹ thuật tiền xử lý: lệch phải nhiều → cần log-transform. Phân phối cũng tiết lộ phân khúc thị trường chính."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• Phân phối giá <strong>lệch phải (right-skewed)</strong> — đuôi kéo dài lên giá cao</li>
            <li>• <strong>Phần lớn tập trung 3–8 triệu/tháng</strong> — phân khúc mass-market chính</li>
            <li>• Diện tích phổ biến <strong>20–40m²</strong>, phù hợp chuẩn phòng trọ TP.HCM</li>
            <li>• price_per_m2 cũng lệch phải → chứng tỏ phân hoá rõ theo vị trí</li>
          </ul>
        }
        conclusion="Phân phối tương đối chuẩn ở vùng giá thực tế. Mô hình cần học mạnh phân khúc 3–8tr để đạt MAE thấp."
      >
        <ChartImg src="/figures/price_distribution.png" alt="Phân phối giá thuê" caption="Histogram + Boxplot phân phối giá thuê toàn dataset" />
      </EDAStep>

      {/* STEP 5 — Location analysis */}
      <EDAStep
        step={5}
        badge="Spatial Analysis"
        title="Phân tích giá theo khu vực — Trung tâm vs Ngoại thành"
        what="Tính median giá theo từng quận/huyện, sắp xếp giảm dần. Vẽ bar chart median và boxplot phân bố. So sánh top 5 vs bottom 5 quận."
        why="Location là yếu tố số 1 trong BĐS. Cần định lượng rõ mức chênh lệch giữa các khu vực để mô hình học được pattern và hệ thống recommender gợi ý đúng ngân sách."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• <strong>Quận 1: 8tr</strong> — cao nhất, gần CBD, văn phòng, thương mại</li>
            <li>• <strong>Cù Chi: 1tr</strong> — thấp nhất, xa trung tâm 40km+</li>
            <li>• Chênh lệch <strong>8×</strong> giữa đắt nhất và rẻ nhất!</li>
            <li>• Quận 3, Quận 5 cũng cao — khu vực truyền thống có hạ tầng tốt</li>
          </ul>
        }
        conclusion="Vị trí (quận) phải là feature quan trọng nhất trong mô hình. One-Hot Encoding 23 quận giúp học được gradient giá theo không gian."
      >
        <ChartImg src="/figures/median_price_by_location.png" alt="Median giá theo vị trí" caption="Median giá thuê theo từng quận/huyện TP.HCM — sắp xếp từ cao đến thấp" />
      </EDAStep>

      {/* STEP 6 — Property type analysis */}
      <EDAStep
        step={6}
        badge="Property Type"
        title="Phân tích theo loại hình bất động sản"
        what="Nhóm dữ liệu theo loại hình (10 nhóm), tính median giá, diện tích, price_per_m2 cho từng nhóm. Vẽ boxplot so sánh và stacked chart theo quận × loại hình."
        why="Dataset có 10 loại hình rất khác nhau (Phòng trọ vs Nhà nguyên căn vs Studio...). Nếu huấn luyện chung một mô hình mà không encode loại hình, sẽ tạo ra bias lớn."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• <strong>Phòng trọ</strong> chiếm 35% số tin nhưng giá thấp nhất (2–5tr)</li>
            <li>• <strong>Nhà nguyên căn</strong>: giá trung bình cao, diện tích lớn — nhóm "outlier" cần tách riêng</li>
            <li>• <strong>Studio</strong>: giá/m² cao hơn Phòng trọ dù diện tích tương đương → premium cho tiện nghi</li>
            <li>• <strong>Căn hộ chung cư</strong>: phân bố rộng, phản ánh chênh lệch lớn theo toà nhà</li>
          </ul>
        }
        conclusion="Loại hình BĐS là feature phân loại quan trọng. Cần encode và xét riêng khi so sánh giá — không thể lấy median chung toàn dataset."
      >
        <TwoCol
          left={<ChartImg src="/figures/median_price_by_type.png" alt="Median giá theo loại hình" caption="Median giá thuê theo từng loại hình" />}
          right={<ChartImg src="/figures/median_area_by_type.png" alt="Median diện tích theo loại hình" caption="Median diện tích theo từng loại hình" />}
        />
      </EDAStep>

      {/* STEP 7 — Keyword analysis */}
      <EDAStep
        step={7}
        badge="Text Analysis"
        title="Phân tích keyword trong tiêu đề tin đăng"
        what="Trích xuất từ khoá từ cột tiêu đề (title), đếm tần suất. Map keyword → biến nhị phân (has_furniture, has_balcony, has_studio...). So sánh giá trung bình giữa nhóm có và không có keyword."
        why="Tiêu đề chứa thông tin ngầm mà các cột có sẵn không capture được. 'Full nội thất', 'view đẹp', 'mới xây' ảnh hưởng trực tiếp đến giá nhưng chưa được cấu trúc hoá."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• <strong>has_furniture</strong> xuất hiện nhiều nhất (~275 tin) — tiện ích số 1 người đăng muốn nhấn mạnh</li>
            <li>• <strong>has_balcony</strong> và <strong>has_studio</strong> theo sau — đây là 2 điểm bán hàng quan trọng</li>
            <li>• <strong>has_elevator</strong> ít nhất — chỉ các toà cao tầng mới có, số lượng hạn chế</li>
            <li>• Tin có furniture cao hơn ~600k/tháng so với tin không có</li>
          </ul>
        }
        conclusion="Keyword extraction tạo ra 7 feature nhị phân mới từ text. Đây là bước Feature Engineering từ dữ liệu phi cấu trúc — tăng thêm signal cho mô hình."
      >
        <TwoCol
          left={<ChartImg src="/figures/keyword_frequency.png" alt="Tần suất keyword" caption="Tần suất xuất hiện keyword trong tiêu đề tin đăng" />}
          right={<ChartImg src="/figures/keyword_price_comparison.png" alt="So sánh giá theo keyword" caption="Chênh lệch giá trung bình: có vs không có keyword" />}
        />
      </EDAStep>

      {/* STEP 8 — Market segmentation */}
      <EDAStep
        step={8}
        badge="Market Segmentation"
        title="Phân khúc thị trường & Correlation"
        what="Phân nhóm thị trường thành 3 phân khúc dựa trên price_per_m2 và area: Tiết kiệm / Tiện nghi vừa / Không gian lớn. Vẽ correlation heatmap giữa các biến số."
        why="Segmentation giúp hiểu thị trường theo góc độ người dùng, không phải chỉ số kỹ thuật. Correlation heatmap cho biết feature nào liên quan chặt với giá → ưu tiên trong model."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• Phân khúc <strong>Tiện nghi vừa</strong> đông nhất (~560 tin, giá 6tr median)</li>
            <li>• <strong>price_vnd ↔ area_m2: r=0.55</strong> — tương quan vừa, không tuyến tính hoàn toàn</li>
            <li>• <strong>price_vnd ↔ price_per_m2: r=0.59</strong> — giá/m² là proxy tốt hơn diện tích thuần</li>
            <li>• <strong>area_m2 ↔ price_per_m2: r=−0.13</strong> — phòng càng nhỏ giá/m² càng cao (premium vị trí)</li>
          </ul>
        }
        conclusion="Tương quan không cao (max 0.59) chứng tỏ quan hệ phi tuyến → cần tree-based models thay vì chỉ dùng Linear Regression."
      >
        <TwoCol
          left={<ChartImg src="/figures/market_segmentation.png" alt="Phân khúc thị trường" caption="3 phân khúc: quy mô (trái) và giá trung vị (phải)" />}
          right={<ChartImg src="/figures/correlation_heatmap.png" alt="Correlation heatmap" caption="Ma trận tương quan giữa các biến số chính" />}
        />
      </EDAStep>

      {/* STEP 9 — Big Insight Heatmap */}
      <EDAStep
        step={9}
        badge="⭐ Key Insight"
        title="Bản đồ nhiệt: Giá × Vị trí × Loại hình"
        what="Tạo pivot table: rows = Loại hình, cols = Quận/Huyện, values = median(price). Visualise bằng seaborn heatmap với gradient màu từ vàng (rẻ) → đỏ đậm (đắt)."
        why="Đây là biểu đồ tổng hợp nhất — trả lời câu hỏi: 'Loại hình X ở Quận Y có giá bao nhiêu?' trong một hình duy nhất. Đây là nền tảng của hệ thống recommender."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• <strong>Penthouse Quận 1 &amp; Quận 3</strong>: đỏ thẫm nhất — đắt nhất toàn dataset (15–17tr)</li>
            <li>• <strong>Phòng trọ</strong> (hàng dày nhất): màu vàng nhạt đều — giá ổn định ít biến động theo quận</li>
            <li>• <strong>Ô trống</strong> (màu trắng): loại hình đó không tồn tại ở quận đó — thông tin vô giá cho recommender</li>
            <li>• Nhà nguyên căn có gradient mạnh nhất — vị trí ảnh hưởng rất lớn đến giá</li>
          </ul>
        }
        conclusion="Heatmap này trực tiếp trở thành lookup table cho hệ thống gợi ý: với ngân sách X và quận Y, đề xuất loại hình Z phù hợp nhất."
        wide
      >
        <ChartImg
          src="/figures/insight_heatmap_gia_vitri_loai_hinh.png"
          alt="Bản đồ nhiệt giá theo loại hình và vị trí"
          caption="Median Giá Thuê (triệu VNĐ) theo Loại Hình × Vị Trí — biểu đồ tổng hợp quan trọng nhất của EDA"
        />
      </EDAStep>

      {/* STEP 10 — Feature Engineering */}
      <EDAStep
        step={10}
        badge="Feature Engineering"
        title="Feature Engineering & Chuẩn bị dữ liệu cho Model"
        what="Tạo price_per_m2, district_avg_price, amenity_count. One-Hot Encoding cho quận (23 cột). Binary encoding cho keyword (7 cột). Min-Max normalize diện tích."
        why="ML chỉ hiểu số. Quận là biến danh nghĩa không có thứ tự → One-Hot phù hợp hơn Label Encoding. price_per_m2 giúp mô hình bắt được phi tuyến diện tích × giá."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• Dataset tăng từ <strong>8 cột gốc → 40+ cột</strong> sau engineering</li>
            <li>• <strong>price_per_m2</strong>: Quận 1 ≈ 280k/m², Cù Chi ≈ 80k/m² → feature phân biệt rõ nhất</li>
            <li>• <strong>amenity_count</strong>: tổng hợp 7 tiện ích thành 1 số — proxy cho chất lượng phòng</li>
            <li>• Train/Test split: <strong>80/20</strong> với stratify theo quận</li>
          </ul>
        }
        conclusion="Dataset cuối cùng sạch, đầy đủ feature, sẵn sàng đưa vào 5 mô hình ML khác nhau từ Basic đến Advanced."
      >
        <TwoCol
          left={<ChartImg src="/figures/median_price_area_price_per_m2_by_location_and_type.png" alt="Median price per m2 by location and type" caption="Median giá, diện tích và giá/m² theo quận và loại hình" />}
          right={<ChartImg src="/figures/price_per_m2_type_scatter_correlation.png" alt="Scatter giá/m² theo loại hình" caption="Scatter plot giá/m² theo loại hình — thấy rõ phân tầng" />}
        />
      </EDAStep>

    </div>
  );
}
