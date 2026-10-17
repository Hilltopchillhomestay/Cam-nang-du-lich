# Hướng dẫn: Cẩm nang khách lưu trú

Trang web này **không cần sửa code** khi thay đổi nội dung. Mọi thông tin (địa điểm, giá, nội quy, WiFi…) nằm trong **Google Sheets**. Bạn sửa bảng tính, khoảng 5 phút sau trang web tự cập nhật.

Các bước 1–3 chỉ làm **một lần** lúc cài đặt.

---

## Các file trong thư mục

| File | Dùng để làm gì | Có cần sửa không |
|---|---|---|
| `index.html` | Khung trang, màu sắc | Chỉ sửa 3 dòng ảnh xem trước Zalo/Facebook (xem mục 5) |
| `app.js` | Xử lý tìm kiếm, lọc, đổi ngôn ngữ | Không |
| `config.js` | Nơi dán link Google Sheets | Sửa **một lần** ở bước 3 |
| `logo.svg` | Logo tạm | Thay bằng logo của bạn |
| `data/*.csv` | Dữ liệu dự phòng, dùng khi chưa nối Google Sheets hoặc Google bị lỗi | Không bắt buộc |
| `du-lieu-du-phong.js` | Bản sao dữ liệu mẫu, giúp trang mở được khi bấm đúp file `index.html` trên máy | Không |
| `mau-google-sheets.xlsx` | File mẫu để tạo Google Sheets | Dùng ở bước 2 |

---

## Bước 0. Xem thử trên máy tính

1. **Giải nén** file `homestay-guide.zip` (chuột phải → *Extract All* / *Giải nén tất cả*). Không mở file bên trong khi còn nằm trong file zip.
2. Vào thư mục vừa giải nén, bấm đúp `index.html`. Trang sẽ mở bằng trình duyệt với dữ liệu mẫu.

Để khách dùng được trên điện thoại, cần làm tiếp bước 1.

## Bước 1. Đưa trang lên mạng (miễn phí bằng GitHub Pages)

1. Tạo tài khoản tại <https://github.com> (nếu chưa có).
2. Bấm **New repository** → đặt tên, ví dụ `cam-nang` → chọn **Public** → **Create repository**.
3. Bấm **uploading an existing file** → mở thư mục đã giải nén, chọn **tất cả** file bên trong (kể cả thư mục `data`) rồi kéo vào → **Commit changes**. Lưu ý: kéo các file bên trong, **không** kéo cả thư mục `homestay-guide` và **không** tải lên file `.zip`.
4. Vào **Settings** → **Pages** → mục *Branch* chọn `main`, thư mục `/ (root)` → **Save**.
5. Chờ 1–2 phút, trang sẽ có địa chỉ dạng `https://<tên-tài-khoản>.github.io/cam-nang/`.

Lúc này trang đã chạy với dữ liệu mẫu trong thư mục `data/`.

> Nếu link báo lỗi 404: kiểm tra trong repository, file `index.html` phải nằm ngay ở trang đầu (không nằm trong thư mục con), và chờ thêm vài phút.

## Bước 2. Tạo Google Sheets từ file mẫu

1. Vào <https://drive.google.com> → **Mới** → **Tải tệp lên** → chọn `mau-google-sheets.xlsx`.
2. Mở file vừa tải lên → **Tệp** → **Lưu dưới dạng Google Trang tính**.
3. Bạn sẽ thấy 4 trang tính (tab ở dưới cùng):
   - `thong_tin`: tên homestay, địa chỉ, hotline, WiFi, giờ nhận/trả phòng.
   - `dia_diem`: các địa điểm quanh homestay.
   - `noi_quy`: phí, đền bù, dịch vụ, tiện nghi.
   - `huong_dan`: giải thích cách điền từng cột (trang web không đọc tab này).
4. Thay dữ liệu mẫu bằng thông tin của bạn.

## Bước 3. Nối Google Sheets vào trang web

1. Trong Google Sheets: **Tệp** → **Chia sẻ** → **Công bố lên web**.
2. Ở ô đầu tiên, đổi *Toàn bộ tài liệu* thành **thong_tin**; ở ô thứ hai chọn **Giá trị được phân tách bằng dấu phẩy (.csv)** → **Công bố** → sao chép đường link.
3. Làm lại bước 2 cho **dia_diem** và **noi_quy**. Bạn sẽ có 3 đường link.
4. Trên GitHub, mở file `config.js` → bấm biểu tượng bút chì (Edit) → dán 3 link vào giữa dấu ngoặc kép:

   ```js
   window.GUIDE_CONFIG = {
     thong_tin: "https://docs.google.com/spreadsheets/d/e/....../pub?gid=0&single=true&output=csv",
     dia_diem:  "https://docs.google.com/spreadsheets/d/e/....../pub?gid=123&single=true&output=csv",
     noi_quy:   "https://docs.google.com/spreadsheets/d/e/....../pub?gid=456&single=true&output=csv"
   };
   ```

5. Bấm **Commit changes**. Xong.

---

## Bước 4. Cập nhật thông tin hằng ngày

Chỉ cần mở Google Sheets và sửa. Không cần vào GitHub nữa.

- **Thêm địa điểm**: thêm một dòng mới ở tab `dia_diem`. Trang tự xếp vào nhóm khoảng cách (dưới 1 km, 1–2,5 km, 2,5–5 km, trên 5 km) và tự sắp xếp từ gần đến xa.
- **Tạm ẩn** một địa điểm hoặc một dòng nội quy: gõ `x` vào cột `an`. Xoá `x` để hiện lại.
- **Đổi giá, giờ, WiFi**: sửa ô tương ứng.
- **Bản tiếng Anh**: điền các cột `..._en`. Nếu để trống, bản tiếng Anh dùng tạm nội dung tiếng Việt.
- **Nút Google Maps**: dán link chia sẻ từ Google Maps vào cột `link_google_maps`. Để trống thì nút sẽ tìm theo tên và địa chỉ.

Sau khi sửa, **chờ khoảng 5 phút** (Google cần thời gian cập nhật bản công bố) rồi tải lại trang.

**Không được:** đổi tên các tab (`thong_tin`, `dia_diem`, `noi_quy`), đổi tên cột ở dòng 1, hay đổi chữ ở cột `khoa` của tab `thong_tin`.

---

## 5. Lưu ý khác

- **Logo**: tải file logo của bạn (ví dụ `logo.png`) lên GitHub, rồi sửa ô `logo` trong tab `thong_tin` thành `logo.png`.
- **Ảnh xem trước khi gửi link qua Zalo/Messenger/Facebook**: các ứng dụng này không đọc Google Sheets. Hãy sửa trực tiếp các dòng `og:title`, `og:description`, `og:image` ở đầu file `index.html` (ảnh nên là `.jpg` hoặc `.png`).
- **Màu sắc**: đổi các mã màu trong khối `:root` ở đầu file `index.html`.
- **Mật khẩu WiFi** hiển thị công khai với bất kỳ ai có link. Nếu không muốn, để trống ô `wifi_mat_khau`.
- **Nếu Google Sheets bị lỗi**: trang dùng bản tải gần nhất trên máy khách, nếu không có thì dùng dữ liệu trong `data/`. Nên thỉnh thoảng cập nhật thư mục `data/` (Google Sheets → Tệp → Tải xuống → .csv) để bản dự phòng không quá cũ.
- **Mã QR**: dùng bất kỳ trang tạo mã QR miễn phí nào, dán địa chỉ GitHub Pages, in ra và đặt trong phòng.
- **Mở thẳng bản tiếng Anh**: thêm `?lang=en` vào cuối địa chỉ, ví dụ `https://.../cam-nang/?lang=en`. Trang cũng ghi nhớ ngôn ngữ khách đã chọn.
