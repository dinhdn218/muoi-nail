# Mười Nail Studio

Website concept cho một thương hiệu nail đại chúng, phong cách lifestyle, có animation. Dùng để demo khi chào hàng.

> **Mười ngón tay, mười tâm trạng.**
> Tên thương hiệu, địa chỉ, giá và thông tin liên hệ trong trang là nội dung minh họa.

## Tính năng

- **Thử màu trên tay:** bàn tay minh họa bằng SVG, sơn màu theo hiệu ứng nét cọ. Đổi được màu, dáng móng (tròn, vuông, hạnh nhân, ballerina) và tông da. Màu nền, chữ nhấn và logo đổi theo màu đang chọn. Khi khách chưa bấm gì, màu tự đổi lần lượt.
- **Bảng màu Phố, Thu Đông 2026:** 12 màu dạng chai sơn, lọc theo độ hoàn thiện bóng, lì, nhũ. Bấm vào chai để sơn thử lên tay.
- **Gợi ý theo dịp:** đi làm, cà phê cuối tuần, hẹn hò, đi biển, tiệc cuối năm. Mỗi dịp có bộ móng mẫu, dịch vụ, thời gian và giá. Nút "Thử bộ này trên tay" sơn từng ngón theo bộ đó.
- **Bảng giá** dạng menu tiệm, có gói combo.
- **Thẻ Mười:** thẻ tích dấu, lần thứ 10 miễn phí. Các dấu được đóng lần lượt khi cuộn tới.
- **Chi nhánh:** trạng thái mở cửa tính theo giờ Việt Nam.
- **Đặt lịch:** chọn dịch vụ, màu, chi nhánh, ngày và khung giờ. Khung giờ đã qua tự khóa, số điện thoại được kiểm tra. Bản demo chỉ hiện màn hình xác nhận, không gửi dữ liệu đi đâu.
- Hiển thị tốt trên điện thoại, có giao diện sáng và tối, tôn trọng cài đặt giảm chuyển động của hệ điều hành.

Không dùng framework hay bước build. Chỉ có HTML, CSS và JavaScript thuần, font lấy từ Google Fonts (Unbounded và Be Vietnam Pro).

## Cấu trúc

```
index.html            Nội dung trang
assets/css/style.css  Giao diện, màu sắc (token ở :root), animation
assets/js/main.js     Dữ liệu và tương tác
```

## Chạy thử trên máy

Mở thẳng `index.html` bằng trình duyệt, hoặc chạy một server tĩnh:

```bash
python3 -m http.server 8000
# rồi mở http://localhost:8000
```

## Đưa lên mạng bằng GitHub Pages

1. Vào **Settings → Pages** của repo.
2. Ở **Build and deployment**, chọn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`.
3. Sau khoảng một phút, trang chạy tại `https://dinhdn218.github.io/muoi-nail/`.

## Thay nội dung cho khách hàng thật

Toàn bộ dữ liệu nằm ở đầu các khối trong `assets/js/main.js`:

| Hằng số      | Nội dung                                              |
|--------------|-------------------------------------------------------|
| `COLORS`     | Mã màu, tên màu, mã hex, độ hoàn thiện (`bong`, `li`, `nhu`) |
| `HERO_SW`    | Các màu hiện ở bảng thử màu đầu trang                 |
| `OCC`        | Các dịp gợi ý: màu từng ngón, dáng móng, dịch vụ, giá |
| `BRANCHES`   | Danh sách chi nhánh                                   |
| `SERVICES`   | Dịch vụ trong form đặt lịch                           |
| `SLOTS`      | Khung giờ đặt lịch                                    |

- Bảng giá, câu chữ các phần và hotline nằm trong `index.html`.
- Màu thương hiệu và font nằm ở khối `:root` đầu file `assets/css/style.css`. Đổi `--accent` để đổi màu chủ đạo.
- Giờ mở cửa đang là 9:00 đến 21:00, sửa trong hàm `statusText()` của `main.js`.
- Form đặt lịch hiện chỉ chạy phía trình duyệt. Khi làm thật, nối phần xử lý `submit` trong `main.js` với backend, Google Sheets hoặc hệ thống đặt lịch của tiệm.
