**KẾ HOẠCH PHÁT TRIỂN BACKEND**

**Website bán hàng gia dụng**

*MongoDB + Express.js + TypeScript + Mongoose*

# I. QUY ƯỚC PHÂN QUYỀN

Hệ thống sử dụng RBAC (Role-Based Access Control). Frontend chỉ hiển thị chức năng phù hợp, nhưng Backend bắt buộc kiểm tra quyền trước khi thực hiện API.

| **Chức năng**                | **USER**     | **ADMIN**      |
|------------------------------|--------------|----------------|
| Xem dữ liệu công khai        | ✓            | ✓              |
| Xem dữ liệu cá nhân của mình | ✓            | Theo nghiệp vụ |
| Thêm dữ liệu hệ thống        | ✗            | ✓              |
| Sửa dữ liệu hệ thống         | ✗            | ✓              |
| Xóa dữ liệu hệ thống         | ✗            | ✓              |
| Quản lý User                 | ✗            | ✓              |
| Quản lý sản phẩm             | ✗            | ✓              |
| Quản lý đơn hàng             | Đơn của mình | Toàn bộ        |
| Quản lý thanh toán           | Của mình     | Toàn bộ        |
| Dashboard thống kê           | ✗            | ✓              |

## Nguyên tắc bảo mật

- [ ] Không chỉ ẩn nút trên Frontend; Backend phải kiểm tra role bằng middleware.
- [ ] USER chỉ được truy cập dữ liệu thuộc tài khoản của chính mình.
- [ ] ADMIN được truy cập API quản trị theo nghiệp vụ.
- [ ] Không cho USER tự thay đổi role thành ADMIN.

# II. AUTH – ĐĂNG KÝ / ĐĂNG NHẬP

**Mục đích:** Xác thực tài khoản và phiên đăng nhập.

## USER – Người dùng

- [ ] Đăng ký
- [ ] Xác thực OTP
- [ ] Gửi lại OTP
- [ ] Đăng nhập
- [ ] Đăng xuất
- [ ] Xem tài khoản của mình
- [ ] Đổi mật khẩu
- [ ] Quên/đặt lại mật khẩu

## ADMIN – Quản trị viên

- [ ] Đăng nhập Admin
- [ ] Đăng xuất
- [ ] Xem thông tin Admin
- [ ] Truy cập API quản trị khi có role ADMIN

## API / quyền truy cập dự kiến

```
POST /api/auth/register → PUBLIC
POST /api/auth/login → PUBLIC
GET /api/auth/me → USER/ADMIN
```

# III. USER – QUẢN LÝ TÀI KHOẢN

**Mục đích:** Quản lý thông tin và trạng thái tài khoản.

## USER – Người dùng

- [ ] Xem/sửa profile của mình
- [ ] Đổi mật khẩu
- [ ] Xem trạng thái tài khoản

## ADMIN – Quản trị viên

- [ ] Xem danh sách/chi tiết User
- [ ] Tìm kiếm/lọc
- [ ] Khóa/mở khóa
- [ ] Vô hiệu hóa
- [ ] Quản lý role theo nghiệp vụ

## API / quyền truy cập dự kiến

```
GET /api/users/me → USER
PUT /api/users/me → USER
GET /api/admin/users → ADMIN
```

# IV. USER ADDRESS – ĐỊA CHỈ

**Mục đích:** Quản lý địa chỉ giao hàng.

## USER – Người dùng

- [ ] Xem
- [ ] Thêm
- [ ] Sửa
- [ ] Xóa
- [ ] Đặt mặc định địa chỉ của mình
- [ ] Không xem địa chỉ người khác

## ADMIN – Quản trị viên

- [ ] Xem địa chỉ khi xử lý đơn theo nghiệp vụ

## API / quyền truy cập dự kiến

```
GET /api/addresses → USER
POST /api/addresses → USER
PUT /api/addresses/:id → USER – chủ sở hữu
```

# V. CATEGORY – DANH MỤC

**Mục đích:** Quản lý danh mục cha/con.

## USER – Người dùng

- [ ] Xem danh sách
- [ ] Xem chi tiết
- [ ] Xem danh mục con
- [ ] Xem sản phẩm thuộc danh mục
- [ ] Không thêm/sửa/xóa/bật tắt

## ADMIN – Quản trị viên

- [ ] Xem toàn bộ
- [ ] Thêm
- [ ] Sửa
- [ ] Xóa
- [ ] Bật/tắt
- [ ] Đổi thứ tự
- [ ] Quản lý cha/con

## API / quyền truy cập dự kiến

```
GET /api/categories → PUBLIC
POST /api/categories → ADMIN
PUT /api/categories/:id → ADMIN
DELETE /api/categories/:id → ADMIN
```

# VI. BRAND – THƯƠNG HIỆU

**Mục đích:** Quản lý thương hiệu.

## USER – Người dùng

- [ ] Xem danh sách
- [ ] Xem chi tiết
- [ ] Xem sản phẩm theo thương hiệu

## ADMIN – Quản trị viên

- [ ] Xem toàn bộ
- [ ] Thêm
- [ ] Sửa
- [ ] Xóa
- [ ] Bật/tắt

## API / quyền truy cập dự kiến

```
GET /api/brands → PUBLIC
POST /api/brands → ADMIN
PUT /api/brands/:id → ADMIN
DELETE /api/brands/:id → ADMIN
```

# VII. ATTRIBUTE – THUỘC TÍNH

**Mục đích:** Quản lý thuộc tính và giá trị thuộc tính.

## USER – Người dùng

- [ ] Xem thuộc tính
- [ ] Xem giá trị thuộc tính

## ADMIN – Quản trị viên

- [ ] Thêm/sửa/xóa thuộc tính
- [ ] Thêm/sửa/xóa giá trị

## API / quyền truy cập dự kiến

```
GET /api/attributes → PUBLIC
POST /api/attributes → ADMIN
PUT /api/attributes/:id → ADMIN
```

# VIII. PRODUCT – SẢN PHẨM

**Mục đích:** Quản lý thông tin sản phẩm.

## USER – Người dùng

- [ ] Xem danh sách/chi tiết
- [ ] Xem hình ảnh, giá, khuyến mãi
- [ ] Xem thương hiệu/danh mục
- [ ] Xem biến thể/tồn kho hiển thị
- [ ] Xem đánh giá
- [ ] Tìm kiếm/lọc/sắp xếp
- [ ] Thêm giỏ hàng/wishlist

## ADMIN – Quản trị viên

- [ ] Xem toàn bộ
- [ ] Thêm
- [ ] Sửa
- [ ] Xóa
- [ ] Bật/tắt
- [ ] Đánh dấu nổi bật
- [ ] Đổi giá
- [ ] Quản lý tồn kho
- [ ] Quản lý biến thể/media

## API / quyền truy cập dự kiến

```
GET /api/products → PUBLIC
GET /api/products/:id → PUBLIC
POST /api/products → ADMIN
PUT /api/products/:id → ADMIN
DELETE /api/products/:id → ADMIN
```

# IX. PRODUCT VARIANT – BIẾN THỂ

**Mục đích:** Quản lý SKU, giá và tồn kho theo biến thể.

## USER – Người dùng

- [ ] Xem biến thể
- [ ] Chọn biến thể
- [ ] Xem giá/tồn kho

## ADMIN – Quản trị viên

- [ ] Thêm
- [ ] Sửa
- [ ] Xóa
- [ ] Đổi giá
- [ ] Đổi tồn kho
- [ ] Bật/tắt

## API / quyền truy cập dự kiến

```
GET /api/products/:id/variants → PUBLIC
POST /api/products/:id/variants → ADMIN
PUT /api/variants/:id → ADMIN
```

# X. PRODUCT MEDIA – HÌNH ẢNH / VIDEO

**Mục đích:** Quản lý media sản phẩm.

## USER – Người dùng

- [ ] Xem hình ảnh/video

## ADMIN – Quản trị viên

- [ ] Thêm
- [ ] Xóa
- [ ] Đặt ảnh chính
- [ ] Đổi thứ tự

## API / quyền truy cập dự kiến

```
GET /api/products/:id/media → PUBLIC
POST /api/products/:id/media → ADMIN
DELETE /api/media/:id → ADMIN
```

# XI. CART – GIỎ HÀNG

**Mục đích:** Quản lý giỏ riêng của User.

## USER – Người dùng

- [ ] Xem giỏ của mình
- [ ] Thêm
- [ ] Đổi số lượng
- [ ] Xóa
- [ ] Xóa toàn bộ
- [ ] Kiểm tra tồn kho

## ADMIN – Quản trị viên

- [ ] Không thao tác giỏ User trong nghiệp vụ thông thường

## API / quyền truy cập dự kiến

```
GET /api/cart → USER
POST /api/cart → USER
PUT /api/cart/:id → USER – chủ sở hữu
```

# XII. WISHLIST – YÊU THÍCH

**Mục đích:** Quản lý sản phẩm yêu thích.

## USER – Người dùng

- [ ] Xem wishlist của mình
- [ ] Thêm
- [ ] Xóa
- [ ] Chuyển sang giỏ

## ADMIN – Quản trị viên

- [ ] Không thao tác wishlist User trong nghiệp vụ thông thường

## API / quyền truy cập dự kiến

```
GET /api/wishlist → USER
POST /api/wishlist → USER
DELETE /api/wishlist/:id → USER – chủ sở hữu
```

# XIII. COUPON – MÃ GIẢM GIÁ

**Mục đích:** Quản lý chương trình giảm giá.

## USER – Người dùng

- [ ] Xem coupon công khai
- [ ] Kiểm tra
- [ ] Áp dụng khi checkout
- [ ] Không tạo/sửa/xóa

## ADMIN – Quản trị viên

- [ ] Xem tất cả
- [ ] Thêm
- [ ] Sửa
- [ ] Xóa
- [ ] Bật/tắt
- [ ] Thiết lập thời gian/giới hạn
- [ ] Xem lượt sử dụng

## API / quyền truy cập dự kiến

```
GET /api/coupons/public → PUBLIC
POST /api/coupons/check → USER
POST /api/admin/coupons → ADMIN
PUT /api/admin/coupons/:id → ADMIN
```

# XIV. CHECKOUT – ĐẶT HÀNG

**Mục đích:** Tạo đơn từ giỏ hàng.

## USER – Người dùng

- [ ] Chọn địa chỉ
- [ ] Chọn sản phẩm
- [ ] Chọn thanh toán
- [ ] Nhập coupon
- [ ] Xem tổng tiền
- [ ] Xác nhận đặt hàng

## ADMIN – Quản trị viên

- [ ] Quản lý đơn sau khi User đặt; không đặt hàng thay User trong nghiệp vụ thường

## API / quyền truy cập dự kiến

```
POST /api/checkout → USER
```

# XV. ORDER – ĐƠN HÀNG

**Mục đích:** Quản lý đơn từ tạo đến hoàn thành/hủy/hoàn trả.

## USER – Người dùng

- [ ] Xem đơn của mình
- [ ] Xem chi tiết
- [ ] Xem trạng thái/thanh toán
- [ ] Hủy nếu còn cho phép
- [ ] Xem lịch sử mua
- [ ] Không xem đơn User khác

## ADMIN – Quản trị viên

- [ ] Xem toàn bộ
- [ ] Tìm kiếm/lọc
- [ ] Theo trạng thái/thời gian/User/phương thức
- [ ] Xác nhận
- [ ] Xử lý
- [ ] Giao hàng
- [ ] Hoàn thành
- [ ] Hủy
- [ ] Hoàn trả

## API / quyền truy cập dự kiến

```
GET /api/orders/my-orders → USER
GET /api/orders/:id → USER – chủ sở hữu
GET /api/admin/orders → ADMIN
PUT /api/admin/orders/:id/status → ADMIN
```

# XVI. ORDER ITEM – CHI TIẾT ĐƠN

**Mục đích:** Lưu snapshot sản phẩm tại thời điểm mua.

## USER – Người dùng

- [ ] Xem sản phẩm trong đơn của mình
- [ ] Xem tên/SKU/biến thể/số lượng/đơn giá

## ADMIN – Quản trị viên

- [ ] Xem toàn bộ order item để xử lý/thống kê

## API / quyền truy cập dự kiến

```
GET /api/orders/:id/items → USER – chủ sở hữu / ADMIN
```

# XVII. PAYMENT – THANH TOÁN

**Mục đích:** Quản lý giao dịch và trạng thái thanh toán.

## USER – Người dùng

- [ ] Chọn phương thức
- [ ] Thanh toán đơn của mình
- [ ] Xem trạng thái/lịch sử của mình

## ADMIN – Quản trị viên

- [ ] Xem toàn bộ giao dịch
- [ ] Xem mã/số tiền
- [ ] Đối soát
- [ ] Xử lý hoàn tiền

## API / quyền truy cập dự kiến

```
POST /api/payments → USER
GET /api/payments/my-payments → USER
GET /api/admin/payments → ADMIN
```

# XVIII. PRODUCT REVIEW – ĐÁNH GIÁ

**Mục đích:** Đánh giá và kiểm duyệt nội dung.

## USER – Người dùng

- [ ] Xem review
- [ ] Đánh giá sản phẩm đã mua
- [ ] Sửa/xóa review của mình
- [ ] Không sửa/duyệt review người khác

## ADMIN – Quản trị viên

- [ ] Xem tất cả
- [ ] Duyệt
- [ ] Ẩn
- [ ] Xóa review vi phạm
- [ ] Quản lý trạng thái

## API / quyền truy cập dự kiến

```
GET /api/products/:id/reviews → PUBLIC
POST /api/products/:id/reviews → USER – đã mua
PUT /api/reviews/:id → USER – chủ sở hữu
PUT /api/admin/reviews/:id/status → ADMIN
```

# XIX. ADMIN MANAGEMENT – QUẢN TRỊ

**Mục đích:** Tập trung chức năng quản trị toàn hệ thống.

## USER – Người dùng

- [ ] Không truy cập khu vực quản trị

## ADMIN – Quản trị viên

- [ ] Quản lý User, Category, Brand, Attribute, Product, Variant, Media, Coupon, Order, Payment, Review

## API / quyền truy cập dự kiến

GET/POST/PUT/DELETE /api/admin/\* → ADMIN

# XX. ADMIN DASHBOARD – TỔNG HỢP

**Mục đích:** Dashboard chỉ dành cho Admin.

## USER – Người dùng

- [ ] Không được xem số liệu tổng hợp hệ thống

## ADMIN – Quản trị viên

- [ ] Tổng doanh thu
- [ ] Doanh thu ngày/tháng/năm
- [ ] Tổng đơn và trạng thái
- [ ] Sản phẩm bán chạy/hết hàng
- [ ] Tổng User/User mới
- [ ] Coupon hoạt động/hết hạn/lượt dùng
- [ ] Review chờ duyệt/đã duyệt/bị ẩn

## API / quyền truy cập dự kiến

```
GET /api/admin/dashboard/overview → ADMIN
GET /api/admin/dashboard/revenue → ADMIN
GET /api/admin/dashboard/orders → ADMIN
GET /api/admin/dashboard/products → ADMIN
GET /api/admin/dashboard/users → ADMIN
```

# XXI. AI PRODUCT ASSISTANT – TRỢ LÝ SẢN PHẨM

**Mục đích:** AI chỉ truy vấn trong phạm vi dữ liệu website.

## USER – Người dùng

- [ ] Hỏi sản phẩm
- [ ] Hỏi theo danh mục/thương hiệu/giá/thuộc tính
- [ ] Hỏi sản phẩm phù hợp
- [ ] Nhận danh sách sản phẩm từ database

## ADMIN – Quản trị viên

- [ ] Xem thống kê/log nếu triển khai
- [ ] Quản lý cấu hình và phạm vi dữ liệu AI

## API / quyền truy cập dự kiến

```
POST /api/ai/product-assistant → USER
GET /api/admin/ai/logs → ADMIN
```

# XXII. THỨ TỰ TRIỂN KHAI

- [ ] AUTH – ĐĂNG KÝ / ĐĂNG NHẬP
- [ ] USER – QUẢN LÝ TÀI KHOẢN
- [ ] USER ADDRESS – ĐỊA CHỈ
- [ ] CATEGORY – DANH MỤC
- [ ] BRAND – THƯƠNG HIỆU
- [ ] ATTRIBUTE – THUỘC TÍNH
- [ ] PRODUCT – SẢN PHẨM
- [ ] PRODUCT VARIANT – BIẾN THỂ
- [ ] PRODUCT MEDIA – HÌNH ẢNH / VIDEO
- [ ] CART – GIỎ HÀNG
- [ ] WISHLIST – YÊU THÍCH
- [ ] COUPON – MÃ GIẢM GIÁ
- [ ] CHECKOUT – ĐẶT HÀNG
- [ ] ORDER – ĐƠN HÀNG
- [ ] ORDER ITEM – CHI TIẾT ĐƠN
- [ ] PAYMENT – THANH TOÁN
- [ ] PRODUCT REVIEW – ĐÁNH GIÁ
- [ ] ADMIN MANAGEMENT – QUẢN TRỊ
- [ ] ADMIN DASHBOARD – TỔNG HỢP
- [ ] AI PRODUCT ASSISTANT – TRỢ LÝ SẢN PHẨM

# XXIII. CHECKLIST PHÂN QUYỀN CUỐI

- [ ] Mỗi API đã xác định PUBLIC / USER / ADMIN.
- [ ] USER chỉ truy cập dữ liệu của chính mình.
- [ ] USER không gọi được API thêm/sửa/xóa dữ liệu quản trị.
- [ ] ADMIN API có middleware kiểm tra role.
- [ ] Order/Payment/Review kiểm tra quyền sở hữu khi cần.
- [ ] Dashboard chỉ ADMIN.
- [ ] Frontend ẩn/hiện theo role nhưng Backend vẫn bắt buộc kiểm tra quyền.
