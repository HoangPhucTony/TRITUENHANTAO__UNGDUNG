# Tổng hợp kết quả phân tích dataset PhongTro.xlsx
## 1. Phạm vi
- Chỉ sử dụng dataset PhongTro.xlsx
- Không sử dụng dữ liệu external

## 2. Tổng quan dữ liệu
- Số dòng raw: 1,399
- Số dòng sau loại trùng: 1,391
- Số dòng dùng cho phân tích: 1,368
- Median giá thuê: 5,700,000 VNĐ
- Median diện tích: 34.0 m²
- Median giá trên m²: 160,357 VNĐ/m²

## 3. Insight chính
- Dataset sau làm sạch và lọc ngoại lệ phục vụ phân tích còn 1,368 tin đăng.
- Median giá thuê là 5,700,000 VNĐ; phân phối giá có xu hướng lệch phải.
- Median diện tích là 34.0 m²; phần lớn tin đăng tập trung ở nhóm diện tích nhỏ và vừa.
- Vị trí có median giá cao nổi bật là Quận 1 với mức khoảng 8,000,000 VNĐ.
- Loại hình có median giá cao nhất là Nhà nguyên căn (~10,000,000 VNĐ), trong khi thấp nhất là Phòng trọ (~3,400,000 VNĐ).
- Tương quan giữa diện tích và giá thuê là 0.55, cho thấy mối liên hệ dương nhưng không hoàn toàn tuyến tính.
- Keyword xuất hiện nhiều nhất trong tiêu đề là 'has_furniture' với 276 tin.

## 4. Hạn chế
- Dữ liệu là dữ liệu tin đăng, không phải giá giao dịch thực tế.
- Dataset không chứa đầy đủ các biến chi tiết như tọa độ, phí dịch vụ, số toilet, tình trạng nội thất chuẩn hóa.
- Một số đặc điểm sản phẩm được suy ra từ tiêu đề nên chỉ mang tính xấp xỉ.
- Kết quả phân tích mang tính mô tả trên sample hiện có, không đại diện tuyệt đối cho toàn thị trường.
