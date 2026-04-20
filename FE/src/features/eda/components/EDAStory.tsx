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
        title="Bắt đầu từ 1,399 mẩu tin rao vặt"
        what="Chúng tôi thu thập dữ liệu từ phongtro123.com — một trong những cổng thông tin phòng trọ lớn nhất Việt Nam. Sau khi load file PhongTro.xlsx, chúng tôi kiểm tra 'sức khoẻ' dữ liệu qua 6 cột gốc: Tiêu đề, Diện tích, Giá, Vị trí, Phân loại và Số phòng."
        why="Để xây dựng một mô hình AI tin cậy, chúng ta không thể 'đoán mò'. Việc quan sát dữ liệu thô giúp xác định các thách thức như: dữ liệu có bị lệch không? Có nhiều tin rác không? Cần bao nhiêu bước làm sạch?"
        insight={
          <ul className="space-y-1 text-xs">
            <li>• <strong>Phòng trọ (≈35%)</strong> và <strong>Nhà nguyên căn (≈28%)</strong> là hai nhóm chủ đạo, cho thấy sự đa dạng của thị trường cho thuê TP.HCM.</li>
            <li>• Dữ liệu bao phủ <strong>24 quận/huyện</strong>, nhưng tập trung cực kỳ đậm đặc tại Quận 1, Quận 7 và Bình Thạnh.</li>
            <li>• Có sự xuất hiện của các tin đăng giá 100 triệu — dấu hiệu của Penthouse hoặc Căn hộ cao cấp cần được phân loại kỹ.</li>
          </ul>
        }
        conclusion="Dataset thô có độ bao phủ tốt nhưng 'nhiễu' cao, đòi hỏi một quy trình làm sạch nghiêm ngặt."
      >
        <TwoCol
          left={<ChartImg src="/figures/listing_count_by_type.png" alt="Số lượng tin theo loại hình" caption="Cơ cấu loại hình BĐS: Phòng trọ chiếm ưu thế" />}
          right={<ChartImg src="/figures/listing_count_by_location.png" alt="Số lượng tin theo vị trí" caption="Mật độ tin đăng: Quận 1 và Quận 7 dẫn đầu" />}
        />
      </EDAStep>

      {/* STEP 2 — Pre-processing */}
      <EDAStep
        step={2}
        badge="Data Cleaning"
        title="Dọn dẹp 'nhiễu' và chuẩn hóa địa lý"
        what="Chúng tôi thực hiện 4 bước làm sạch cốt lõi: (1) Chuẩn hóa tên cột về snake_case, (2) Tách số từ chuỗi '30m2' thành float, (3) Gộp 43 cách ghi địa điểm về 24 quận/huyện chuẩn, (4) Loại bỏ các dòng trùng lặp hoàn toàn."
        why="Dữ liệu cào (web scraping) thường rất lộn xộn. 'Quận 1' và 'Quan 1' là một, nhưng AI sẽ hiểu là hai nếu không chuẩn hóa. Xóa trùng giúp tránh việc mô hình 'học thuộc lòng' một tin đăng xuất hiện nhiều lần."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• Phát hiện <strong>8 dòng trùng lặp</strong> hoàn toàn — có vẻ là tin đăng spam/tin đẩy.</li>
            <li>• Số lượng địa điểm rút gọn từ <strong>43 xuống còn 24</strong> nhờ thuật toán fuzzy mapping — tăng đáng kể độ ổn định cho mô hình.</li>
            <li>• 100% dữ liệu diện tích và giá được đưa về định dạng số chuẩn để tính toán.</li>
          </ul>
        }
        conclusion="Sau khi làm sạch, dataset trở nên đồng nhất, giảm 44% sự phân mảnh địa lý."
      >
        <ChartImg src="/figures/price_area_price_per_m2_distribution.png" alt="Phân phối sau làm sạch" caption="Dữ liệu sau khi chuẩn hóa: Phân phối trở nên rõ ràng và dễ phân tích hơn" />
      </EDAStep>

      {/* STEP 3 — Outliers */}
      <EDAStep
        step={3}
        badge="Outlier Filtering"
        title="Sàng lọc những con số 'vô lý'"
        what="Sử dụng phương pháp lọc ngưỡng thực tế: Chỉ giữ lại các phòng có giá từ 500k đến 100 triệu VNĐ, và diện tích từ 8m² đến 300m². Các tin đăng nằm ngoài vùng này được coi là ngoại lai (outlier)."
        why="Thị trường phòng trọ thực tế hiếm khi có giá 100k hay diện tích 1m². Những con số này thường là lỗi nhập liệu hoặc tin giả. Nếu không loại bỏ, chúng sẽ làm mô hình dự đoán bị lệch hàng triệu đồng."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• Có <strong>23 tin đăng (≈1.6%)</strong> bị loại bỏ vì quá vô lý hoặc quá cao so với mặt bằng chung phòng trọ.</li>
            <li>• Sau khi lọc, biểu đồ scatter <strong>Diện tích vs Giá</strong> cho thấy một xu hướng đi lên rõ rệt (tương quan thuận).</li>
            <li>• Càng diện tích lớn, độ phân tán giá càng cao — chứng tỏ diện tích không phải là yếu tố duy nhất quyết định giá.</li>
          </ul>
        }
        conclusion="Loại bỏ outlier giúp mô hình tập trung vào phân khúc thị trường thực, tăng độ chính xác thực tế."
      >
        <TwoCol
          left={<ChartImg src="/figures/boxplot_price_by_location.png" alt="Boxplot giá theo vị trí" caption="Boxplot: Nhận diện các điểm ngoại lai theo từng khu vực" />}
          right={<ChartImg src="/figures/area_vs_price_scatter.png" alt="Scatter area vs price" caption="Mối quan hệ Diện tích - Giá: Xu hướng tăng trưởng rõ nét" />}
        />
      </EDAStep>

      {/* STEP 4 — Price distribution */}
      <EDAStep
        step={4}
        badge="Distribution"
        title="Bức tranh phân phối: Ai đang chiếm lĩnh thị trường?"
        what="Chúng tôi vẽ Histogram và đường mật độ KDE để xem giá và diện tích tập trung ở đâu. Phân nhóm giá thành 3 mức: Thấp (<4tr), Trung bình (4-8.5tr) và Cao (>8.5tr)."
        why="Hiểu phân phối giúp ta biết đâu là 'khách hàng mục tiêu' của hệ thống. Nếu hầu hết là phòng 3-5tr, mô hình cần được tối ưu để dự đoán cực tốt ở vùng này."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• <strong>Phân phối lệch phải (Right-skewed)</strong>: Đa số phòng tập trung ở mức giá bình dân, nhưng có một 'đuôi dài' các căn hộ cao cấp.</li>
            <li>• Vùng 'vàng' của thị trường là <strong>3 triệu – 7 triệu/tháng</strong> với diện tích <strong>20m² – 35m²</strong>.</li>
            <li>• Giá trên mỗi m² (Price per m²) có đỉnh nhọn, cho thấy thị trường có một mặt bằng giá ngầm khá ổn định.</li>
          </ul>
        }
        conclusion="Thị trường có tính phân hoá cao. Mô hình cần bắt được đặc tính của cả nhóm phổ thông và nhóm cao cấp."
      >
        <ChartImg src="/figures/price_distribution.png" alt="Phân phối giá thuê" caption="Phân phối giá thuê: Đỉnh tập trung ở vùng 4-6 triệu VNĐ" />
      </EDAStep>

      {/* STEP 5 — Location analysis */}
      <EDAStep
        step={5}
        badge="Spatial Logic"
        title="Vị trí là 'Vua': Chênh lệch giá theo khu vực"
        what="Tính toán trung vị (Median) giá thuê của từng quận và sắp xếp theo thứ hạng. So sánh trực quan mức sống giữa các quận trung tâm và ngoại ô."
        why="Trong BĐS, vị trí chiếm 70% giá trị. Một phòng 20m² ở Quận 1 chắc chắn đắt hơn 50m² ở Hóc Môn. Chúng ta cần định lượng hóa sự chênh lệch này cho AI."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• <strong>Quận 1 và Quận 3</strong> giữ ngôi vương với giá median ≈ 8 triệu VNĐ.</li>
            <li>• <strong>Củ Chi, Cần Giờ, Hóc Môn</strong> ở cuối bảng với giá chỉ từ 1.5 – 2.5 triệu VNĐ.</li>
            <li>• Chênh lệch giá giữa trung tâm và ngoại ô có thể lên tới <strong>4-5 lần</strong> cho cùng một diện tích.</li>
          </ul>
        }
        conclusion="Quận/Huyện là biến số đầu vào quan trọng nhất. AI cần trọng số lớn cho yếu tố vị trí địa lý."
      >
        <ChartImg src="/figures/median_price_by_location.png" alt="Median giá theo vị trí" caption="Bảng xếp hạng giá thuê median: Quận 1 dẫn đầu tuyệt đối" />
      </EDAStep>

      {/* STEP 6 — Property type analysis */}
      <EDAStep
        step={6}
        badge="Segmentation"
        title="Không phải phòng nào cũng giống nhau"
        what="Phân tích sâu vào 10 loại hình: Căn hộ mini, Studio, Nhà nguyên căn... So sánh tương quan giữa Loại hình vs Giá vs Diện tích."
        why="Gộp chung tất cả vào một giỏ sẽ làm mờ đi đặc tính riêng. Căn hộ dịch vụ (Studio) thường có giá thuê/m² cao hơn nhiều so với phòng trọ truyền thống vì tiện ích đi kèm."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• <strong>Nhà nguyên căn</strong> có diện tích median lớn nhất nhưng giá/m² lại thấp hơn Studio.</li>
            <li>• <strong>Studio</strong> là phân khúc có giá thuê ổn định và cao cấp nhất trong nhóm phòng nhỏ.</li>
            <li>• Phân khúc <strong>Căn hộ chung cư</strong> có sự biến động lớn nhất (râu boxplot dài), phản ánh sự khác biệt giữa chung cư cũ và cao cấp.</li>
          </ul>
        }
        conclusion="Cần biến 'Loại hình' thành biến phân loại (Categorical) để AI học được định mức giá cho từng phân khúc."
      >
        <TwoCol
          left={<ChartImg src="/figures/median_price_by_type.png" alt="Median giá theo loại hình" caption="Giá thuê median theo loại hình: Nhà nguyên căn vs Căn hộ" />}
          right={<ChartImg src="/figures/median_area_by_type.png" alt="Median diện tích theo loại hình" caption="Diện tích median: Sự áp đảo của Nhà nguyên căn" />}
        />
      </EDAStep>

      {/* STEP 7 — Keyword analysis */}
      <EDAStep
        step={7}
        badge="Feature Engineering"
        title="Khai phá 'mỏ vàng' từ tiêu đề tin đăng"
        what="Sử dụng Regex trích xuất các từ khóa: 'full nội thất', 'ban công', 'thang máy', 'mới xây'... Chuyển chúng thành các biến nhị phân (0/1)."
        why="Nhiều thông tin đắt giá nằm ở Tiêu đề chứ không có trong cột dữ liệu cứng. Việc có ban công hay thang máy có thể làm tăng giá phòng thêm 500k-1tr đồng."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• <strong>20% (276 tin)</strong> nhấn mạnh 'Nội thất' trong tiêu đề — đây là yêu cầu hàng đầu của khách thuê hiện đại.</li>
            <li>• Phòng có <strong>Ban công</strong> có giá cao hơn trung bình ≈ 700k VNĐ so với phòng không đề cập.</li>
            <li>• <strong>Thang máy</strong> xuất hiện ít nhất (1%) nhưng thường đi kèm với các phòng cao cấp ở quận trung tâm.</li>
          </ul>
        }
        conclusion="Feature Engineering từ text giúp tăng độ giàu có cho dữ liệu, giúp AI hiểu được giá trị cộng thêm của tiện ích."
      >
        <TwoCol
          left={<ChartImg src="/figures/keyword_frequency.png" alt="Tần suất keyword" caption="Top các từ khóa được nhà đầu tư nhấn mạnh nhiều nhất" />}
          right={<ChartImg src="/figures/keyword_price_comparison.png" alt="So sánh giá theo keyword" caption="Giá trị cộng thêm: Phòng có tiện ích luôn có giá cao hơn" />}
        />
      </EDAStep>

      {/* STEP 8 — Market segmentation */}
      <EDAStep
        step={8}
        badge="Market Insight"
        title="Mối tương quan và Phân khúc thị trường"
        what="Tính toán hệ số tương quan Pearson giữa các biến. Phân chia dataset thành các nhóm dựa trên quy mô (Nhỏ/Vừa/Lớn) và giá (Rẻ/Trung/Cao)."
        why="Tương quan giúp ta loại bỏ các biến thừa (đa cộng tuyến) và tập trung vào các biến ảnh hưởng mạnh nhất đến giá. Phân khúc giúp ta kiểm tra độ phủ của dataset."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• <strong>Tương quan Giá - Diện tích (r=0.55)</strong>: Một mức tương quan khá, cho thấy diện tích quan trọng nhưng không phải tất cả.</li>
            <li>• <strong>Giá trên m² (r=0.59)</strong> có tương quan mạnh hơn với giá tổng, chứng tỏ vị trí/tiện ích đóng vai trò chủ chốt.</li>
            <li>• Phân khúc <strong>Giá trung bình (4-8.5tr)</strong> chiếm tỷ trọng lớn nhất, là vùng mô hình sẽ học chính xác nhất.</li>
          </ul>
        }
        conclusion="Mối quan hệ giữa các biến là phi tuyến (non-linear), gợi ý việc sử dụng các mô hình Tree-based (XGBoost/RF) sẽ hiệu quả hơn Linear."
      >
        <TwoCol
          left={<ChartImg src="/figures/market_segmentation.png" alt="Phân khúc thị trường" caption="Phân bổ tin đăng theo quy mô giá và diện tích" />}
          right={<ChartImg src="/figures/correlation_heatmap.png" alt="Correlation heatmap" caption="Ma trận tương quan: Tìm kiếm những biến số 'quyền lực'" />}
        />
      </EDAStep>

      {/* STEP 9 — Big Insight Heatmap */}
      <EDAStep
        step={9}
        badge="⭐ The Ultimate Chart"
        title="Toàn cảnh giá thuê TP.HCM: Vị trí × Loại hình"
        what="Xây dựng bản đồ nhiệt (Heatmap) thể hiện giá median cho sự kết hợp giữa mỗi Quận và mỗi Loại hình phòng."
        why="Đây là 'át chủ bài' của EDA. Nó trả lời câu hỏi: 'Nếu tôi muốn thuê Studio ở Quận 7 thì giá trung bình là bao nhiêu?' — cung cấp cái nhìn tổng thể nhất cho người dùng."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• <strong>Điểm nóng (Đỏ đậm)</strong>: Tập trung ở Penthouse/Duplex tại Quận 1 và Quận 3 — giá vượt ngưỡng 15 triệu.</li>
            <li>• <strong>Vùng ổn định (Vàng nhạt)</strong>: Phòng trọ tại các quận Tân Bình, Gò Vấp, Bình Thạnh có giá cực kỳ đồng đều (3.5-5tr).</li>
            <li>• <strong>Cơ hội (Ô trắng)</strong>: Những vùng chưa có dữ liệu loại hình đó — gợi ý cho các nhà đầu tư về phân khúc đang bị bỏ ngỏ.</li>
          </ul>
        }
        conclusion="Bản đồ này chính là 'xương sống' cho hệ thống gợi ý thông minh của SmartStay AI."
        wide
      >
        <ChartImg
          src="/figures/insight_heatmap_gia_vitri_loai_hinh.png"
          alt="Bản đồ nhiệt giá theo loại hình và vị trí"
          caption="Ma trận Giá thuê: Cái nhìn toàn cảnh về thị trường phòng trọ TP.HCM"
        />
      </EDAStep>

      {/* STEP 10 — Feature Engineering */}
      <EDAStep
        step={10}
        badge="Final Ready"
        title="Tổng kết Feature Engineering & Sẵn sàng cho Model"
        what="Chúng tôi chốt lại bộ feature cuối cùng gồm: area_m2 (số), standardized_location (dummy), property_type_clean (dummy) và 7 biến keyword (binary). Lưu file phongtro_cleaned.csv."
        why="Dữ liệu tốt là 80% thành công của AI. Sau các bước EDA, chúng ta đã biến một file Excel thô sơ thành một tập dữ liệu giàu tính hiệu, sạch sẽ và có ý nghĩa thống kê."
        insight={
          <ul className="space-y-1 text-xs">
            <li>• Từ <strong>6 cột ban đầu</strong>, chúng ta đã tạo ra <strong>20+ feature</strong> có giá trị.</li>
            <li>• <strong>1,368 bản ghi chất lượng cao</strong> sẵn sàng để huấn luyện 5 loại mô hình máy học khác nhau.</li>
            <li>• Mọi biến số đã được đưa về dạng số để thuật toán có thể 'đọc' được.</li>
          </ul>
        }
        conclusion="Quá trình EDA kết thúc. Chúng ta đã có một nền móng vững chắc để xây dựng 'bộ não' định giá cho SmartStay AI."
      >
        <TwoCol
          left={<ChartImg src="/figures/median_price_area_price_per_m2_by_location_and_type.png" alt="Phân tích đa biến" caption="Sự kết hợp giữa Vị trí - Diện tích - Giá/m²" />}
          right={<ChartImg src="/figures/price_per_m2_type_scatter_correlation.png" alt="Phân tầng giá" caption="Tương quan Giá/m² theo loại hình: Phân hoá rõ rệt chất lượng" />}
        />
      </EDAStep>

    </div>
  );
}
