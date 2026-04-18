import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import os

df = pd.read_csv(r"d:\Coding\Computer Science\Personal Project\TR-TU-NH-N-T-O-NG-D-NG-\Analysis\outputs\data\phongtro_cleaned.csv")
pivot_price = df.pivot_table(index='phanloai', columns='vitri', values='giavnd', aggfunc='median')

plt.figure(figsize=(14, 8))
sns.heatmap(pivot_price, annot=True, cmap='YlOrRd', fmt='.1f', linewidths=.5)
plt.title('Bản đồ nhiệt: Median Giá (Triệu VNĐ) theo Loại Hình và Vị Trí', pad=20, fontsize=14, fontweight='bold')
plt.ylabel('Loại hình', fontweight='bold')
plt.xlabel('Vị trí (Quận/Huyện)', fontweight='bold')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()

out_dir = r"d:\Coding\Computer Science\Personal Project\TR-TU-NH-N-T-O-NG-D-NG-\Analysis\outputs\figures"
os.makedirs(out_dir, exist_ok=True)
plt.savefig(os.path.join(out_dir, "insight_heatmap_gia_vitri_loai_hinh.png"), dpi=300)
print("Saved heatmap to", os.path.join(out_dir, "insight_heatmap_gia_vitri_loai_hinh.png"))
