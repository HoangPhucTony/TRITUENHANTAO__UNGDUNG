import json

notebook_path = r'd:\Coding\Computer Science\Personal Project\TR-TU-NH-N-T-O-NG-D-NG-\Analysis\Analysis_Code\notebooks\main\Main_EDA.ipynb'
with open(notebook_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

new_markdown = {
    "cell_type": "markdown",
    "metadata": {},
    "source": [
        "## Phân tích Insight Nâng cao (Bổ sung)\n",
        "Biểu đồ Heatmap dưới đây cho thấy sự phân bổ giá trung bình kết hợp cả 2 chiều: Phân khúc (Loại hình) và Vị trí (Quận/Huyện). Nó giúp ta nhanh chóng tìm ra các 'vùng trũng' về giá hoặc những khu vực tập trung phân khúc cao cấp."
    ]
}

new_code = {
    "cell_type": "code",
    "execution_count": None,
    "metadata": {},
    "outputs": [],
    "source": [
        "# BỔ SUNG: INSIGHT HEATMAP MẬT ĐỘ GIÁ THEO LOẠI HÌNH VÀ VỊ TRÍ\n",
        "print_section(\"Insight Nâng cao: Heatmap Giá Trung Bình theo Loại hình và Vị trí\")\n",
        "\n",
        "try:\n",
        "    pivot_price = df_clean.pivot_table(index='phanloai', columns='vitri', values='giavnd', aggfunc='median')\n",
        "    plt.figure(figsize=(14, 8))\n",
        "    sns.heatmap(pivot_price, annot=True, cmap='YlOrRd', fmt='.1f', linewidths=.5)\n",
        "    plt.title('Bản đồ nhiệt: Median Giá (Triệu VNĐ) theo Loại Hình và Vị Trí', pad=20, fontsize=14, fontweight='bold')\n",
        "    plt.ylabel('Loại hình', fontweight='bold')\n",
        "    plt.xlabel('Vị trí (Quận/Huyện)', fontweight='bold')\n",
        "    plt.xticks(rotation=45, ha='right')\n",
        "    plt.tight_layout()\n",
        "    save_figure(plt.gcf(), 'insight_heatmap_gia_vitri_loai_hinh')\n",
        "    plt.show()\n",
        "except Exception as e:\n",
        "    print('Lỗi khi vẽ Heatmap:', e)\n"
    ]
}

already_added = any("BỔ SUNG: INSIGHT HEATMAP" in "".join(c.get("source", [])) for c in nb["cells"])

if not already_added:
    nb['cells'].append(new_markdown)
    nb['cells'].append(new_code)
    with open(notebook_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, ensure_ascii=False, indent=1)
    print("Added new insight cell to notebook.")
else:
    print("Insight cell already exists.")
