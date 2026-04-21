import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
  objective: string;
  observation: React.ReactNode;
  interpretation: string;
  implication: string;
  children: React.ReactNode;
  wide?: boolean;
}

function ExplainBlock({ label, content }: { label: string; content: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-4">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
        {label}
      </div>
      <div className="text-sm leading-relaxed text-muted-foreground">{content}</div>
    </div>
  );
}

function EDAStep({
  step,
  badge,
  title,
  objective,
  observation,
  interpretation,
  implication,
  children,
  wide,
}: StepProps) {
  return (
    <motion.section {...anim} className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground">
          {step}
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">{title}</h2>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {badge}
            </Badge>
          </div>
        </div>
      </div>

      <Card className="glass-card overflow-hidden">
        <div className={`${wide ? "p-2" : "p-4"} border-b border-border bg-foreground/[0.02]`}>
          {children}
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <ExplainBlock label="Mục tiêu phân tích" content={objective} />
          <ExplainBlock label="Quan sát từ biểu đồ" content={observation} />
          <ExplainBlock label="Diễn giải" content={interpretation} />
          <ExplainBlock label="Hàm ý cho hệ thống" content={implication} />
        </div>
      </Card>
    </motion.section>
  );
}

function ChartImg({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-border/50 shadow-sm">
        <img
          src={src}
          alt={alt}
          className="block max-h-[480px] w-full object-contain"
          style={{ background: "#ffffff" }}
        />
      </div>
      {caption ? (
        <p className="px-2 text-center text-[11px] italic text-muted-foreground">{caption}</p>
      ) : null}
    </div>
  );
}

function TwoCol({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{left}{right}</div>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((item) => (
        <li key={item}>- {item}</li>
      ))}
    </ul>
  );
}

export function EDAStory() {
  return (
    <div className="space-y-14">
      <EDAStep
        step={1}
        badge="Dataset Overview"
        title="Tổng quan dữ liệu tin đăng"
        objective="Khảo sát quy mô mẫu, độ bao phủ địa lý và cơ cấu loại hình của tập dữ liệu đầu vào trước khi tiến hành làm sạch."
        observation={
          <BulletList
            items={[
              "Dữ liệu thu thập từ file PhongTro.xlsx gồm khoảng 1.399 tin đăng ban đầu.",
              "Hai nhóm xuất hiện nhiều nhất là Phòng trọ và Nhà nguyên căn, cho thấy tập dữ liệu không chỉ phản ánh phân khúc giá rẻ.",
              "Tin đăng phân bố trên 24 quận, huyện nhưng tập trung mạnh ở các khu vực trung tâm và cận trung tâm như Quận 1, Quận 7 và Bình Thạnh.",
            ]}
          />
        }
        interpretation="Tập dữ liệu có độ phủ không gian tương đối tốt, song phân bố mẫu không đồng đều giữa các địa bàn. Điều này cho thấy thị trường thuê nhà tại TP.HCM mang tính tập trung cao và mô hình sau này cần chú ý tới hiện tượng lệch mẫu theo vị trí."
        implication="Ở các bước tiếp theo, biến vị trí và loại hình cần được chuẩn hóa cẩn thận để tránh việc cùng một khu vực bị tách thành nhiều nhãn khác nhau."
      >
        <TwoCol
          left={
            <ChartImg
              src="/figures/listing_count_by_type.png"
              alt="Biểu đồ số lượng tin đăng theo loại hình"
              caption="Hình 1. Cơ cấu tin đăng theo loại hình bất động sản cho thuê."
            />
          }
          right={
            <ChartImg
              src="/figures/listing_count_by_location.png"
              alt="Biểu đồ số lượng tin đăng theo quận huyện"
              caption="Hình 2. Mật độ tin đăng theo khu vực tại TP.HCM."
            />
          }
        />
      </EDAStep>

      <EDAStep
        step={2}
        badge="Data Cleaning"
        title="Làm sạch và chuẩn hóa dữ liệu đầu vào"
        objective="Đưa dữ liệu thô về cấu trúc thống nhất để các phép phân tích và mô hình học máy có thể xử lý ổn định."
        observation={
          <BulletList
            items={[
              "Các cột gốc được chuẩn hóa về định dạng tên nhất quán và chuyển đổi sang kiểu dữ liệu phù hợp.",
              "Thông tin diện tích và giá thuê được tách khỏi chuỗi văn bản để chuyển thành biến số.",
              "Nhiều cách ghi địa danh khác nhau được quy về 24 quận, huyện chuẩn; đồng thời phát hiện và loại bỏ các dòng trùng lặp hoàn toàn.",
            ]}
          />
        }
        interpretation="Dữ liệu tin đăng trực tuyến thường nhiễu do khác biệt cách nhập liệu, viết không dấu hoặc sai chính tả. Nếu không chuẩn hóa ngay từ đầu, mô hình sẽ coi các biến thể cùng nghĩa là các giá trị hoàn toàn khác nhau và làm suy giảm chất lượng học."
        implication="Bước làm sạch là điều kiện bắt buộc để hình thành tập dữ liệu huấn luyện có tính nhất quán. Sau bước này, các thống kê mô tả mới có giá trị so sánh giữa các khu vực và phân khúc."
      >
        <ChartImg
          src="/figures/price_area_price_per_m2_distribution.png"
          alt="Phân phối giá diện tích và giá trên mét vuông sau khi chuẩn hóa"
          caption="Hình 3. Phân phối của các biến số chính sau bước chuẩn hóa dữ liệu."
        />
      </EDAStep>

      <EDAStep
        step={3}
        badge="Outlier Filtering"
        title="Nhận diện và loại bỏ ngoại lệ"
        objective="Loại bỏ các quan sát không hợp lý về mặt thị trường nhằm tránh làm sai lệch các thống kê trung tâm và mô hình dự báo."
        observation={
          <BulletList
            items={[
              "Các ngưỡng thực nghiệm được áp dụng cho giá thuê và diện tích để giữ lại phần dữ liệu nằm trong phạm vi thị trường có ý nghĩa.",
              "Sau khi lọc, đồ thị phân tán Diện tích - Giá thể hiện xu hướng đồng biến rõ ràng hơn.",
              "Boxplot theo khu vực vẫn cho thấy sự phân tán khác nhau giữa các quận, nhưng số điểm quá cực đoan đã giảm đáng kể.",
            ]}
          />
        }
        interpretation="Ngoại lệ trong dữ liệu tin đăng thường đến từ lỗi nhập liệu, giá thuê ghi sai đơn vị hoặc các phân khúc quá đặc thù so với phần còn lại của tập mẫu. Việc lọc ngoại lệ không nhằm làm đẹp dữ liệu, mà nhằm giữ cho mô hình tập trung vào vùng thị trường đại diện."
        implication="Sau bước này, mối quan hệ giữa các biến trở nên dễ diễn giải hơn, đặc biệt là quan hệ giữa diện tích và giá thuê. Điều đó giúp các mô hình dự báo giảm rủi ro bị kéo lệch bởi một số ít quan sát bất thường."
      >
        <TwoCol
          left={
            <ChartImg
              src="/figures/boxplot_price_by_location.png"
              alt="Boxplot giá thuê theo khu vực"
              caption="Hình 4. Phân bố giá thuê theo khu vực sau khi sàng lọc ngoại lệ."
            />
          }
          right={
            <ChartImg
              src="/figures/area_vs_price_scatter.png"
              alt="Biểu đồ phân tán diện tích và giá thuê"
              caption="Hình 5. Quan hệ giữa diện tích và giá thuê trên tập dữ liệu đã làm sạch."
            />
          }
        />
      </EDAStep>

      <EDAStep
        step={4}
        badge="Distribution"
        title="Phân phối giá thuê và diện tích"
        objective="Xác định vùng giá và vùng diện tích chiếm tỷ trọng lớn trong thị trường để nhận diện phân khúc chủ đạo."
        observation={
          <BulletList
            items={[
              "Phân phối giá thuê có dạng lệch phải: phần lớn tin đăng tập trung ở nhóm giá trung bình, trong khi số ít căn cao cấp tạo thành đuôi dài.",
              "Cụm quan sát dày nhất nằm quanh khoảng 3 đến 7 triệu đồng mỗi tháng.",
              "Phân phối giá trên mét vuông tập trung hơn so với giá tổng, phản ánh sự tồn tại của một mặt bằng giá ngầm trong thị trường.",
            ]}
          />
        }
        interpretation="Thị trường không phân bố đều giữa các mức giá. Phân khúc phổ thông và trung bình chiếm ưu thế về số lượng, trong khi phân khúc cao cấp tồn tại nhưng ít hơn và có độ biến động mạnh."
        implication="Khi xây dựng mô hình dự báo, cần lưu ý rằng độ chính xác tổng thể có xu hướng chịu ảnh hưởng mạnh bởi nhóm mẫu đông nhất. Vì vậy, việc theo dõi sai số theo từng phân khúc giá là cần thiết."
      >
        <ChartImg
          src="/figures/price_distribution.png"
          alt="Biểu đồ phân phối giá thuê"
          caption="Hình 6. Phân phối giá thuê của tập dữ liệu sau khi làm sạch."
        />
      </EDAStep>

      <EDAStep
        step={5}
        badge="Spatial Logic"
        title="Ảnh hưởng của vị trí địa lý đến giá thuê"
        objective="Đo lường mức chênh lệch giá giữa các quận, huyện nhằm đánh giá vai trò của vị trí trong cơ chế hình thành giá."
        observation={
          <BulletList
            items={[
              "Giá thuê trung vị tại Quận 1 và Quận 3 thuộc nhóm cao nhất toàn bộ tập dữ liệu.",
              "Các huyện ngoại thành như Củ Chi, Cần Giờ và Hóc Môn có mức giá trung vị thấp hơn đáng kể.",
              "Khoảng cách giá giữa nhóm trung tâm và ngoại thành rất lớn ngay cả khi xét trên cùng một thị trường cho thuê.",
            ]}
          />
        }
        interpretation="Vị trí địa lý là một trong những biến có sức phân tầng mạnh nhất đối với giá thuê. Khu vực trung tâm phản ánh lợi thế tiếp cận việc làm, dịch vụ và hạ tầng; trong khi ngoại thành có mặt bằng giá thấp hơn do khoảng cách và mức độ thuận tiện thấp hơn."
        implication="Biến quận, huyện cần được xem là đặc trưng nền tảng trong mô hình dự báo. Trong giao diện người dùng, phân tích theo vị trí cũng cần được trình bày rõ vì đây là yếu tố trực quan nhất đối với quyết định thuê."
      >
        <ChartImg
          src="/figures/median_price_by_location.png"
          alt="Biểu đồ giá thuê trung vị theo khu vực"
          caption="Hình 7. Giá thuê trung vị theo quận, huyện tại TP.HCM."
        />
      </EDAStep>

      <EDAStep
        step={6}
        badge="Segmentation"
        title="Khác biệt giữa các loại hình cho thuê"
        objective="So sánh mức giá và quy mô diện tích giữa các loại hình nhằm nhận diện đặc trưng riêng của từng phân khúc sản phẩm."
        observation={
          <BulletList
            items={[
              "Nhà nguyên căn có diện tích trung vị lớn nhất nhưng không phải lúc nào cũng có giá trên mét vuông cao nhất.",
              "Studio và các loại căn hộ dịch vụ nhỏ có xu hướng duy trì mức giá cao hơn trong nhóm diện tích nhỏ.",
              "Nhóm căn hộ chung cư cho thấy độ phân tán lớn, phản ánh sự khác biệt đáng kể giữa chung cư phổ thông và chung cư cao cấp.",
            ]}
          />
        }
        interpretation="Loại hình cho thuê không chỉ phản ánh cấu trúc vật lý của tài sản mà còn phản ánh gói tiện ích đi kèm, đối tượng khách hàng mục tiêu và mức sẵn sàng chi trả."
        implication="Nếu bỏ qua biến loại hình, mô hình sẽ trộn lẫn nhiều phân khúc có cơ chế định giá khác nhau. Do đó, đây là biến phân loại cần được mã hóa rõ ràng trong pipeline huấn luyện."
      >
        <TwoCol
          left={
            <ChartImg
              src="/figures/median_price_by_type.png"
              alt="Biểu đồ giá trung vị theo loại hình"
              caption="Hình 8. Giá thuê trung vị theo loại hình cho thuê."
            />
          }
          right={
            <ChartImg
              src="/figures/median_area_by_type.png"
              alt="Biểu đồ diện tích trung vị theo loại hình"
              caption="Hình 9. Diện tích trung vị theo loại hình cho thuê."
            />
          }
        />
      </EDAStep>

      <EDAStep
        step={7}
        badge="Feature Engineering"
        title="Khai thác thông tin ngữ nghĩa từ tiêu đề tin đăng"
        objective="Trích xuất các tín hiệu tiện ích và chất lượng từ văn bản tiêu đề để bổ sung cho các biến cấu trúc truyền thống."
        observation={
          <BulletList
            items={[
              "Các từ khóa như nội thất, ban công, thang máy và mới xây xuất hiện với tần suất khác nhau giữa các tin đăng.",
              "Những tin có nhắc đến tiện ích đi kèm thường có mức giá trung bình cao hơn nhóm không đề cập.",
              "Từ khóa thang máy xuất hiện ít nhưng tập trung ở các phân khúc và khu vực có mức giá cao hơn.",
            ]}
          />
        }
        interpretation="Nhiều yếu tố tạo giá trị thực tế không nằm trong các cột số liệu gốc mà nằm trong phần mô tả hoặc tiêu đề. Việc chuyển các tín hiệu ngôn ngữ này thành biến nhị phân giúp mô hình tiếp cận tốt hơn giá trị cộng thêm của tiện ích."
        implication="Feature engineering từ văn bản là bước quan trọng để tăng sức giải thích của mô hình. Đồng thời, đây cũng là phần có thể được diễn giải trực tiếp cho người dùng trong giao diện dự báo."
      >
        <TwoCol
          left={
            <ChartImg
              src="/figures/keyword_frequency.png"
              alt="Tần suất xuất hiện của các từ khóa"
              caption="Hình 10. Tần suất xuất hiện của các từ khóa tiện ích trong tiêu đề tin đăng."
            />
          }
          right={
            <ChartImg
              src="/figures/keyword_price_comparison.png"
              alt="So sánh giá thuê theo từ khóa"
              caption="Hình 11. So sánh giá thuê giữa nhóm có và không có từ khóa tiện ích."
            />
          }
        />
      </EDAStep>

      <EDAStep
        step={8}
        badge="Market Insight"
        title="Tương quan giữa các biến và phân khúc thị trường"
        objective="Đánh giá mức độ liên hệ giữa các biến chính và xác định nhóm phân khúc chiếm tỷ trọng lớn trong dữ liệu."
        observation={
          <BulletList
            items={[
              "Hệ số tương quan giữa giá thuê và diện tích ở mức trung bình, cho thấy diện tích quan trọng nhưng không giải thích toàn bộ biến động giá.",
              "Giá trên mét vuông có mức liên hệ mạnh hơn với giá tổng, gợi ý tác động đồng thời của vị trí và tiện ích.",
              "Phân khúc giá trung bình chiếm tỷ trọng lớn nhất trong tập dữ liệu.",
            ]}
          />
        }
        interpretation="Mối quan hệ giữa các biến không thuần tuyến tính. Giá thuê chịu tác động đồng thời của nhiều yếu tố và các yếu tố này có thể tương tác với nhau theo từng phân khúc."
        implication="Kết quả này ủng hộ việc ưu tiên các mô hình tree-based hoặc mô hình ensemble thay vì chỉ dựa vào mô hình tuyến tính đơn giản."
      >
        <TwoCol
          left={
            <ChartImg
              src="/figures/market_segmentation.png"
              alt="Biểu đồ phân khúc thị trường"
              caption="Hình 12. Phân bố mẫu theo các nhóm giá và quy mô diện tích."
            />
          }
          right={
            <ChartImg
              src="/figures/correlation_heatmap.png"
              alt="Ma trận tương quan"
              caption="Hình 13. Ma trận tương quan giữa các biến chính trong tập dữ liệu."
            />
          }
        />
      </EDAStep>

      <EDAStep
        step={9}
        badge="Integrated View"
        title="Toàn cảnh giá thuê theo vị trí và loại hình"
        objective="Quan sát đồng thời hai chiều quan trọng nhất của thị trường là vị trí địa lý và loại hình cho thuê trên cùng một biểu đồ."
        observation={
          <BulletList
            items={[
              "Heatmap cho thấy các ô có cường độ màu cao tập trung ở nhóm loại hình cao cấp tại các quận trung tâm.",
              "Một số loại hình phổ biến tại khu vực cận trung tâm có mức giá khá ổn định, tạo thành vùng màu tương đối đồng đều.",
              "Những ô trắng hoặc ít dữ liệu phản ánh các tổ hợp khu vực - loại hình xuất hiện rất hiếm trong tập mẫu.",
            ]}
          />
        }
        interpretation="Biểu đồ này cho thấy giá thuê không thể được giải thích đầy đủ chỉ bằng một biến đơn lẻ. Vị trí và loại hình cùng tương tác để tạo ra mặt bằng giá của từng phân khúc."
        implication="Đây là biểu đồ có giá trị diễn giải cao nhất cho người dùng cuối. Trong hệ thống SmartStay AI, nó có thể được xem như nền tảng cho phần so sánh giá theo khu vực và phân khúc."
        wide
      >
        <ChartImg
          src="/figures/insight_heatmap_gia_vitri_loai_hinh.png"
          alt="Heatmap giá thuê theo vị trí và loại hình"
          caption="Hình 14. Heatmap giá thuê trung vị theo tổ hợp quận, huyện và loại hình cho thuê."
        />
      </EDAStep>

      <EDAStep
        step={10}
        badge="Final Dataset"
        title="Tập đặc trưng cuối cùng cho mô hình dự báo"
        objective="Tổng hợp các đặc trưng sau EDA để xác nhận tập dữ liệu đã sẵn sàng cho bước xây dựng mô hình."
        observation={
          <BulletList
            items={[
              "Từ bộ cột ban đầu, dữ liệu đã được mở rộng thành tập đặc trưng gồm biến số, biến phân loại chuẩn hóa và các biến nhị phân từ từ khóa.",
              "Sau các bước làm sạch và sàng lọc, tập huấn luyện còn 1.368 bản ghi có chất lượng tốt hơn cho mục tiêu dự báo.",
              "Các đặc trưng cuối cùng đều đã được chuyển về dạng mà mô hình học máy có thể khai thác.",
            ]}
          />
        }
        interpretation="Giai đoạn EDA không chỉ dùng để mô tả dữ liệu mà còn để quyết định tập đặc trưng cuối cùng. Chất lượng của bộ feature quyết định trực tiếp khả năng học và khả năng giải thích của mô hình."
        implication="Tập dữ liệu sau xử lý đã đủ điều kiện để huấn luyện, so sánh và đánh giá nhiều họ mô hình khác nhau. Đồng thời, các feature này cũng tạo nền tảng cho việc diễn giải kết quả dự báo trong giao diện."
      >
        <TwoCol
          left={
            <ChartImg
              src="/figures/median_price_area_price_per_m2_by_location_and_type.png"
              alt="Phân tích đa biến theo vị trí và loại hình"
              caption="Hình 15. Tổng hợp giá thuê, diện tích và giá trên mét vuông theo vị trí và loại hình."
            />
          }
          right={
            <ChartImg
              src="/figures/price_per_m2_type_scatter_correlation.png"
              alt="Biểu đồ tương quan giá trên mét vuông theo loại hình"
              caption="Hình 16. Quan hệ giữa giá trên mét vuông và loại hình cho thuê."
            />
          }
        />
      </EDAStep>
    </div>
  );
}
