# Danh gia va de xuat chuyen nghiep cho phan Demo He thong

## 1. Muc tieu tai lieu

Tai lieu nay duoc viet de danh gia phan `Demo he thong` hien tai cua project `SmartStay AI`, sau do de xuat mot huong nang cap co tinh san pham hon, trung thuc hon ve AI, va thuyet phuc hon khi trinh bay do an.

Pham vi danh gia gom:

- Luong du lieu va model dang duoc su dung trong demo.
- Cach loc, xep hang, canh bao va hien thi cho nguoi dung.
- Muc do "thuc chat AI" cua demo.
- De xuat UX/UI, noi dung, logic va roadmap nang cap.

## 2. Tom tat dieu hanh

### Ket luan ngan

Phan demo hien tai da dat duoc muc "co the trinh dien duoc":

- Co map.
- Co bo loc.
- Co gia AI de so sanh.
- Co trai nghiem chon dia diem.
- Co cam giac "he thong thong minh".

Tuy nhien, neu danh gia theo tieu chuan san pham hoac demo hoc thuat chat luong cao, phan nay **chua hoan chinh**.

### Van de cot loi

1. Demo hien tai dung `XGBoost` de tinh `aiPrice`, nhung phan recommender, scam detection va xep hang van la `heuristic frontend`, khong phai model rieng.
2. Cac yeu to nhu `gan truong`, `gan benh vien`, `vung ngap`, `khu nguy hiem` chua duoc suy ra tu dataset external that; hien tai la gia lap theo rule/hash.
3. UI hien tai khien nguoi dung de hieu nham rang toan bo demo la "AI end-to-end", trong khi thuc te chi co phan dinh gia la model that.
4. Noi dung hien thi con thieu "giai thich cho nguoi dung": diem match duoc tinh the nao, canh bao lua dao co y nghia gi, muc do tin cay den dau.
5. Tieng Viet bi loi encoding o nhieu noi, lam giam manh gia tri trinh bay.

### Danh gia tong the

Neu cham theo 3 goc nhin:

- `Ky thuat`: 6.5/10
- `San pham/UX`: 6/10
- `Suc thuyet trinh do an`: 7/10

Neu duoc nang cap dung huong, phan demo co the len muc:

- `Ky thuat`: 8/10
- `San pham/UX`: 8.5/10
- `Suc thuyet trinh do an`: 9/10

---

## 3. Hien trang demo hien tai

## 3.1. Demo hien tai dang dung cai gi?

### Du lieu dau vao

Demo dang lay danh sach phong tu backend thong qua API `/api/properties`.

Nguon du lieu backend dang doc tu:

- `Analysis/outputs/data/phongtro_cleaned.csv`

Dataset nay duoc sinh tu `PhongTro.xlsx`, khong phai tu cac dataset external khac.

### Model dang duoc su dung

Backend dang dung model de tinh `aiPrice` cho moi tin phong.

Thu tu uu tien model hien tai:

1. `xgb`
2. `rf`
3. `knn`
4. `tree`
5. `linear`

Trong thuc te, neu `xgboost_best_model.joblib` ton tai, demo se uu tien dung `XGBoost` de tinh gia AI cho listing.

### Logic hien tai trong demo

Demo hien tai dang co 3 lop logic:

1. `Gia AI`:
   Backend goi model de du doan `aiPrice`.

2. `Loc`:
   Frontend loc tiep theo:
   - gan truong hoc
   - gan benh vien
   - tranh vung ngap
   - tranh khu nguy hiem

3. `Xep hang`:
   Frontend tu tinh score dua tren:
   - muc do phu hop gia
   - khoang cach toi vi tri nguoi dung chon
   - so tien ich
   - do an toan

### Van de quan trong

`aiPrice` la model that.  
Nhung `match score`, `goi y`, `lua dao`, `gia qua re`, `gan benh vien`, `gan truong`, `ngap`, `nguy hiem` hien tai chu yeu la rule/heuristic.

Do do, demo hien tai la:

- `AI pricing demo + heuristic recommendation demo`

chu chua phai:

- `end-to-end AI recommendation and risk assessment system`

---

## 3.2. Cac diem manh hien tai

### Diem manh 1: Demo co cau truc de hieu

Nguoi xem co the nhanh chong hieu:

- Chon ngan sach
- Chon dia diem
- Xem ban do
- Xem danh sach phong
- So sanh gia dang voi gia AI

Do la mot flow tot cho trinh bay.

### Diem manh 2: Co "visual proof"

Map + card + badge + gia AI giup demo co tinh thuyet phuc manh hon viec chi hien bang text.

### Diem manh 3: Co kha nang mo rong

Kien truc hien tai de nang cap:

- co the thay heuristic bang feature engineering that
- co the them model cho risk scoring
- co the them explainability

---

## 3.3. Cac diem yeu hien tai

### Diem yeu 1: Overclaim AI

Neu khong giai thich ky, nguoi dung/giang vien de hieu rang:

- he thong dung AI de goi y phong
- he thong dung AI de phat hien lua dao

Nhung hien tai:

- AI chi chac chan dung o phan `aiPrice`
- phan con lai phan lon la cong thuc tay

Day la rui ro lon nhat khi demo.

### Diem yeu 2: External context chua that

Cac toggle:

- Gan truong hoc
- Gan benh vien
- Tranh vung ngap
- Tranh khu nguy hiem

nhin rat hay, nhung hien tai chua duoc sinh tu:

- `cosokhamchuabenh.csv`
- `edu_*.csv`
- `MucNuoc.xls`
- `BienCanhBaoSatLo.xls`

Neu bi hoi sau, phan nay de bi bat bai.

### Diem yeu 3: Giai thich cho nguoi dung chua du

Nguoi dung thay:

- `Match 78`
- `Gia hop ly`
- `Canh bao lua dao`

nhung khong duoc giai thich:

- Match tinh theo trong so nao?
- Lua dao la canh bao theo rule hay theo model?
- Gia AI sai so ky vong la bao nhieu?

### Diem yeu 4: Chon dia diem da tot hon nhung chua "that su tin cay"

Da co:

- chon goi y co san
- tim dia chi qua backend geocode
- click map

Nhung van con:

- ket qua tim dia chi co the lech semantic so voi dataset phong tro
- shortlist chua phai "toan bo tap ung vien trong khu" ma la tap da lay tu backend

### Diem yeu 5: Noi dung bi loi encoding

Day la mot diem tru rat manh khi demo thuc te.

---

## 4. Demo nen duoc dinh vi lai nhu the nao?

De demo tro nen "chuyen nghiep", can dinh vi lai cho trung thuc va thuyet phuc.

## Dinh vi de xuat

`SmartStay AI la he thong ho tro tim phong tro thong minh, ket hop:`

- `AI pricing` de uoc tinh gia hop ly
- `rule-based recommendation` de xep hang phong theo nhu cau
- `context-aware filtering` de loc theo vi tri, ngan sach, tien ich va an toan

Neu ve sau tich hop external datasets that, co the nang cap thong diep thanh:

- `AI pricing + context-enriched recommendation`

### Khong nen noi qua som

Khong nen noi:

- "AI phat hien lua dao"
- "AI phan tich benh vien, truong hoc, sat lo"

neu backend/model chua that su lam duoc.

### Nen noi trung thuc hon

Nen noi:

- "He thong canh bao bat thuong gia dua tren chenhlech giua gia dang va gia AI"
- "He thong loc theo context vi tri va muc do an toan"
- "Trong phien ban hien tai, mot so yeu to context dang o muc quy tac demo"

Day la cach noi vua trung thuc vua van giu duoc gia tri thuyet trinh.

---

## 5. De xuat nang cap demo theo huong san pham

## 5.1. Muc tieu UX moi

Nguoi dung khi vao trang demo phai hieu ngay 3 cau hoi:

1. `Toi dang tim phong o dau?`
2. `Phong nao hop voi toi nhat?`
3. `Tai sao he thong lai de xuat phong nay?`

Neu giao dien tra loi ro 3 cau hoi nay, demo se rat manh.

---

## 5.2. Cau truc demo de xuat

De xuat chia demo thanh 3 lop noi dung tren cung mot man hinh:

### Lop 1: Input y dinh nguoi dung

Panel trai:

- Ngan sach
- Dia diem mong muon
- Ban kinh uu tien
- Yeu to uu tien
- Muc do tranh rui ro

### Lop 2: Ket qua de xuat

Vung giua/phai:

- Ban do
- Danh sach top phong phu hop

### Lop 3: Giai thich quyet dinh

Moi card phong can co:

- Gia AI
- Muc chenh voi gia dang
- Khoang cach den diem da chon
- Ly do phong duoc xep hang cao

---

## 5.3. Giao dien de xuat chi tiet

## Wireframe tong quan

```text
+----------------------------------------------------------------------------------+
| Live Demo: Tim phong tro thong minh                                              |
| Nhap nhu cau, chon vi tri, xem phong phu hop va canh bao gia bat thuong.        |
+------------------------------+---------------------------------------------------+
| Bo loc thong minh            | Ban do + ket qua                                 |
|                              |                                                   |
| [Ngan sach: 6 trieu]         | [Map with room markers + selected location]      |
| [Dia diem mong muon       ]  |                                                   |
| [Tim dia chi that]           | 12 phong dang phu hop                             |
| [Ban kinh: 2.5 km]           |                                                   |
|                              | [Card #1] [Card #2] [Card #3]                    |
| Uu tien:                     | [Card #4] [Card #5] [Card #6]                    |
| [x] Gan truong hoc           |                                                   |
| [ ] Gan benh vien            |                                                   |
| [x] Tranh vung ngap          |                                                   |
| [x] Tranh khu nguy hiem      |                                                   |
|                              |                                                   |
| Sap xep theo:                |                                                   |
| [ Diem match ]               |                                                   |
|                              |                                                   |
| 50 phong phu hop             |                                                   |
+------------------------------+---------------------------------------------------+
```

---

## 5.4. De xuat card phong chuyen nghiep hon

Moi card nen co 4 tang thong tin:

### Tang 1: Tieu de + nhan nhanh

- Ten phong
- Quan
- Dien tich
- Badge:
  - `Gia hop ly`
  - `Can nhac them`
  - `Bat thuong`

### Tang 2: Gia

- Gia dang
- Gia AI
- Chenh lech

Vi du:

```text
Gia dang: 6.5 tr
Gia AI:   5.8 tr
Lech:    +0.7 tr (+12%)
```

### Tang 3: Ly do duoc xep hang

Nen co block `Vi sao phong nay hop voi ban?`

Vi du:

- Cach dia diem da chon 1.2 km
- Nam trong ngan sach
- Co 3 tien ich phu hop
- Thuoc khu vuc an toan hon trung binh

### Tang 4: Hanh dong

- `Xem tren ban do`
- `So sanh voi phong khac`
- `Xem giai thich AI`

---

## 5.5. De xuat popup "Giai thich AI"

Day la diem an tien rat manh khi demo.

Moi phong co the mo mot dialog:

### Tieu de

`Giai thich danh gia phong`

### Noi dung

- Model dinh gia: `XGBoost`
- Gia AI du doan: `5.8 trieu`
- Gia dang: `6.5 trieu`
- Muc chenh: `+12%`

### Yeu to tac dong

- Vi tri quan 1: tang gia
- Dien tich 30m2: tang gia vua
- Noi that day du: tang gia
- Khoang cach den diem mong muon: tot

### Ghi chu trung thuc

- "Gia AI la gia uoc tinh dua tren du lieu lich su."
- "Canh bao bat thuong la canh bao ho tro, khong thay the xac minh thuc te."

Neu lam duoc popup nay, demo se rat "co chat san pham".

---

## 6. Logic de xuat cho diem match

## 6.1. Van de cua logic hien tai

Logic hien tai dung nhieu bien hop ly, nhung nguoi dung khong biet score duoc tao ra sao.

## 6.2. De xuat logic minh bach hon

Hien thi cong khai score theo 4 thanh phan:

- `Vi tri`: 35%
- `Gia`: 35%
- `Tien ich`: 20%
- `An toan`: 10%

### Cong thuc UI de xuat

```text
Match score = 0.35 * Location
            + 0.35 * Price
            + 0.20 * Amenities
            + 0.10 * Safety
```

### Tren giao dien

Dung progress bar hoac mini breakdown:

```text
Vi tri     82/100
Gia        76/100
Tien ich   65/100
An toan    90/100
Tong match 78/100
```

Minh bach score se giup demo thuyet phuc hon rat nhieu.

---

## 7. De xuat noi dung wording cho demo

## 7.1. Wording nen dung

Nen dung:

- `Gia AI tham khao`
- `Canh bao bat thuong gia`
- `Goi y phu hop voi nhu cau`
- `Trong ban kinh uu tien`
- `Vi sao he thong de xuat?`

## 7.2. Wording nen tranh

Nen tranh:

- `AI phat hien lua dao` neu chua co model that
- `AI danh gia do an toan khu vuc` neu chua join dataset that
- `AI phan tich benh vien/truong hoc` neu hien tai van la heuristic

---

## 8. De xuat nang cap ky thuat theo 3 giai doan

## Giai doan 1: Lam demo trung thuc, dep, de hieu

Muc tieu:

- giu logic hien tai
- nhung trinh bay trung thuc va ro rang hon

Can lam:

1. Sua encoding toan bo demo.
2. Hien model dang dung de tinh `aiPrice`.
3. Hien breakdown score.
4. Doi wording `lua dao` thanh `canh bao bat thuong gia`.
5. Giai thich ro toggle nao la demo heuristic.

### Loi ich

- nhanh
- an toan
- tang chat luong trinh bay ngay lap tuc

---

## Giai doan 2: Tich hop external datasets that su

Muc tieu:

- bien cac toggle context thanh feature that

### Cach tich hop tung dataset

#### 1. `cosokhamchuabenh.csv`

Dung de tao:

- `distance_to_hospital`
- `hospital_density_within_2km`

#### 2. `edu_ds_donvi_thpt_cong_lap_0.csv`
#### 3. `edu_ds_donvi_thpt_tu_thuc.csv`

Dung de tao:

- `distance_to_school`
- `school_count_within_2km`

#### 4. `MucNuoc.xls`

Dung de tao:

- `flood_risk_score`
- `water_level_zone`

#### 5. `BienCanhBaoSatLo.xls`

Dung de tao:

- `landslide_risk_score`
- `near_erosion_warning_zone`

#### 6. `DuKienDiDan.xls`

Dung de tao:

- `relocation_risk_flag`
- `planning_change_flag`

#### 7. `ApartmentPricesHCM_ChoToT.csv`
#### 8. `VietNamHouseRentDataset2022.csv`

Dung de tao:

- benchmark gia bo sung
- district-level price prior
- external price sanity check

### Dieu kien bat buoc

Muon lam that, can:

- chuan hoa dia chi/quan
- co toa do hoac geocode cho nguon phong tro
- co pipeline feature engineering ro rang

---

## Giai doan 3: Nang cap demo thanh "AI assistant for renter"

Muc tieu:

- demo khong chi la filter + map
- ma la mot cong cu ra quyet dinh

### Y tuong nang cap

Them mot panel phai tren cung:

```text
Tro ly goi y:
"Voi ngan sach 6 trieu gan DH Bach Khoa, he thong uu tien Quan 10, Tan Binh va Phu Nhuan."
"Phong #2 co gia dang cao hon gia AI 12%, nhung bu lai rat gan dia diem ban chon va co noi that day du."
```

Day co the la template-based explanation, chua can LLM.

Neu lam duoc, demo se nhin rat thong minh.

---

## 9. De xuat giao dien demo chi tiet hon

## 9.1. Header

```text
Trai nghiem he thong thong minh
Tim phong tro theo nhu cau, vi tri va muc gia hop ly.
```

Ben duoi header co 3 stat card:

- `Tong so phong dang xet`
- `Model dinh gia dang dung`
- `So phong trong ban kinh`

## 9.2. Panel trai

### Nhom 1: Nhu cau co ban

- Ngan sach
- Dien tich mong muon
- Dia diem mong muon
- Ban kinh uu tien

### Nhom 2: Uu tien song

- Gan truong hoc
- Gan benh vien
- Co noi that
- Co thang may
- Co ban cong

### Nhom 3: Rui ro

- Tranh vung ngap
- Tranh khu nguy hiem
- Chi xem phong "gia hop ly"

### Nhom 4: Kieu xep hang

- Diem phu hop
- Gan nhat
- Re nhat
- Tien ich nhieu nhat

---

## 9.3. Vung ket qua

### Hang 1: Ban do

Ban do nen co legend:

- Xanh: gia hop ly
- Cam: can nhac
- Do: bat thuong
- Xanh duong: diem nguoi dung chon

### Hang 2: Explain summary

Ngay duoi map nen co mot summary strip:

```text
He thong dang uu tien 12 phong trong ban kinh 2.5 km quanh DH Bach Khoa.
Gia hop ly nhat hien tai nam o Quan 10 va Tan Binh.
```

### Hang 3: Card grid

Moi card:

- thu tu xep hang
- badge
- gia
- khoang cach
- ly do de xuat
- nut xem chi tiet

---

## 10. De xuat script thuyet trinh demo

Neu ban demo truoc giang vien, co the trinh bay theo thu tu:

1. "Nguoi dung nhap nhu cau: 6 trieu, gan DH Bach Khoa."
2. "He thong tim dia diem, ve ban kinh uu tien tren ban do."
3. "Backend dung model XGBoost de uoc tinh gia hop ly cho tung listing."
4. "Frontend xep hang listing dua tren gia, khoang cach, tien ich va an toan."
5. "Neu gia dang chenh qua lon so voi gia AI, he thong dua ra canh bao bat thuong."
6. "Trong phien ban hien tai, mot so yeu to context dang o muc demo heuristic; huong phat trien tiep theo la tich hop dataset external that."

Day la mot cach noi rat an toan va chuyen nghiep.

---

## 11. Khuyen nghi uu tien thuc hien

## Uu tien 1: Sua truoc khi demo

- Sua toan bo loi encoding.
- Hien ro model dang dung: `XGBoost`.
- Doi wording `Canh bao lua dao` -> `Canh bao bat thuong gia`.
- Them "Vi sao phong nay duoc goi y?" vao card.
- Ghi chu ngan: `Mot so yeu to context dang o muc quy tac demo`.

## Uu tien 2: Nang chat luong logic

- Khong chi lay 50 phong dau.
- Neu co dia diem chon, uu tien query theo district/zone neu co the.
- Giai thich score minh bach hon.

## Uu tien 3: Nang cap hoc thuat

- Tich hop external datasets that.
- Tao feature engineering moi.
- Train lai model voi context features.

---

## 12. Ket luan cuoi cung

Phan `Demo he thong` cua project hien tai co nen tang kha tot va co kha nang tro thanh diem sang cua do an.

Tuy nhien, de dat muc "chuyen nghiep":

- can trung thuc hon ve vai tro cua AI,
- can minh bach hon ve score/canh bao,
- can dep hon ve noi dung hien thi,
- va neu muon thuyet phuc manh o mat hoc thuat, can tich hop external datasets that su.

### Mot cau danh gia cuoi cung

`Demo hien tai da giong mot san pham.`

`Ban nang cap tiep de no giong mot san pham thong minh va dang tin.`

---

## 13. De xuat hanh dong tiep theo

Neu tiep tuc thuc hien, thu tu toi de xuat la:

1. `Fix encoding`
2. `Refine wording and explainability`
3. `Improve shortlist/query logic`
4. `Integrate external datasets into real features`
5. `Retrain model and update demo story`

Neu can mot muc tieu ngon gon:

`Bien demo tu "nhin hay" thanh "giai thich duoc va bao ve duoc".`
