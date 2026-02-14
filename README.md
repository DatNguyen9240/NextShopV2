Dưới đây là phiên bản được format lại chuyên nghiệp – rõ ràng – dễ đọc – chuẩn README GitHub / tài liệu kỹ thuật nội bộ.

🚀 NextShopV2 – Frontend

Frontend của NextShopV2 được xây dựng bằng Next.js (App Router) + TypeScript, phục vụ hệ thống thương mại điện tử với:

🛍️ Trang khách hàng

🛠️ Dashboard Admin

🚚 Trang Shipper

📌 Overview
Thuộc tính	Mô tả
Framework	Next.js (App Router)
Language	TypeScript
Architecture	Client + Server Components
API Communication	Axios + Server API Proxy
Realtime	Supabase + SignalR
Map Services	Google Places (RapidAPI), OSRM, Nominatim
👥 Roles
🌐 Guest

Xem sản phẩm
Dưới đây là phiên bản được format lại chuyên nghiệp — rõ ràng, dễ đọc và phù hợp README GitHub / tài liệu kỹ thuật nội bộ.

🚀 NextShopV2 – Frontend

Frontend của NextShopV2 được xây dựng bằng Next.js (App Router) + TypeScript, phục vụ hệ thống thương mại điện tử với các giao diện: khách hàng, admin dashboard và shipper.

---

## 📌 Overview

| Thuộc tính | Mô tả |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Architecture | Client + Server Components |
| API Communication | Axios + Server API Proxy |
| Realtime | Supabase + SignalR |
| Map Services | Google Places (RapidAPI), OSRM, Nominatim |

## 👥 Roles

- Guest
   - Xem sản phẩm, tìm kiếm, thêm giỏ hàng (nếu được cho phép), truy cập nội dung công cộng
- User (Buyer)
   - Đăng ký / Đăng nhập, quản lý giỏ hàng, thanh toán, xem lịch sử đơn hàng, chat với support, quản lý địa chỉ & profile, MFA email
- Admin
   - CRUD sản phẩm, quản lý quảng cáo, quản lý đơn hàng, quản lý coupon, xem conversation chat
- Shipper
   - Xem lô hàng được giao, cập nhật vị trí realtime, hoàn thành giao hàng

## 🧩 Chức Năng Chính

### 🛍️ Sản phẩm
- Browse sản phẩm, search & filter, trang chi tiết, CRUD (Admin), upload ảnh sản phẩm

### 🛒 Giỏ Hàng & Thanh Toán
- Thêm / xóa / cập nhật giỏ hàng, áp dụng coupon, tính toán giảm giá, tạo đơn hàng, checkout

### 🔐 Tài Khoản
- JWT + Refresh token (cookie-based), profile management, address management, reset password, MFA

### 📦 Đơn Hàng
- User xem đơn hàng, Admin cập nhật trạng thái, huỷ đơn

### 🎟️ Khuyến Mãi
- Áp mã coupon, tính toán giảm giá server-side, Admin quản lý coupon

### 📤 Upload
- Upload ảnh (multipart/form-data) cho Product, Advertisement

### 💬 Realtime Chat
- Supabase Realtime (Postgres changes), client-side Supabase, server-side Supabase Admin client (service role). API proxy trong `app/api/chat`.

### 🔔 Realtime Notifications
- SignalR hub từ backend
- Hub URL: `{NEXT_PUBLIC_API_URL}/hubs/notifications`

### 🚚 Shipper Tracking
- SignalR realtime tracking, OSRM route calculation, reverse geocoding, autocomplete địa điểm

### 📊 Admin Dashboard
- **Real-time Metrics**: Hiển thị KPIs với charts (bar, pie): users, orders, revenue, products
- **Audit Logs**: Viewer cho inventory, notifications, tracking events
- **Security**: Protected admin routes với authentication

## 🗺️ Map & Geocoding Services

| Service | Nguồn |
|---|---|
| Autocomplete | Google Places (RapidAPI proxy) |
| Place Details | Google Places |
| Reverse Geocode | Nominatim (OSM) |
| Route | OSRM public router |

## 🏗️ Kiến Trúc & Luồng Dữ Liệu

Tổng quan:

Client Components → Axios Client → .NET Backend API → Database

Một số dịch vụ đi qua API proxy của Next.js:

Client → Next.js API Route (app/api) → External Service (Google / OSRM / Supabase Admin)

### 🔐 Authentication Flow
- JWT lưu trong cookie (`accessToken`, `refreshToken`)
- `axiosClient` tự động inject Authorization header, auto refresh khi 401, retry requests

### 💬 Chat Flow
Browser Supabase Client → Realtime Channel → Postgres Changes

Các hành vi cần quyền admin:
Client → Next.js API Route → Supabase Admin Client (Service Role)

### 🔔 SignalR Flow
Frontend → SignalR Hub Connection → Backend (.NET)

Dùng cho: Notifications, Shipper tracking

## 🔌 API Nội Bộ (Next.js API Routes)

Các route dùng làm proxy hoặc xử lý server-side logic:

- Chat
   - POST `app/api/chat/conversation`
   - POST / PATCH / DELETE `app/api/chat/message`
- Maps
   - GET `app/api/places/autocomplete`
   - GET `app/api/places/details`
   - GET `app/api/reverse-geocode`
   - GET `app/api/route`

## 🌐 Backend API Endpoints (Base URL)

`baseURL = process.env.NEXT_PUBLIC_API_URL`

### 🔐 Authentication
- `/api/auth/register`
- `/api/auth/login/start`
- `/api/auth/logout`
- `/api/auth/me`
- `/api/auth/refresh`
- `/api/auth/forgot-password`
- `/api/auth/reset-password`
- `/api/auth/mfa/*`
- `/api/auth/me/address`

### 🛍️ Products
- `/api/Product`
- `/api/Product/admin`
- `/api/Product/{id}`

### 🛒 Cart
- `/api/Cart`
- `/api/Cart/add`
- `/api/Cart/items/{id}`
- `/api/Cart/clear`
- `/api/Cart/count`

### 📦 Orders
- `/api/orders`
- `/api/orders/{id}`
- `/api/orders/{id}/status`
- `/api/orders/{id}/cancel`
- `/api/orders/my-orders`

### 📤 Upload
- `/api/Upload`

### 👤 User
- `/api/user`
- `/api/auth/me`

### 📢 Advertisements
- `/api/Advertisements`
- `/api/Advertisements/type/{type}`
- `/api/Advertisements/{id}`

### 🎟️ Coupon
- `/api/Coupon`
- `/api/Coupon/code/{code}`
- `/api/Coupon/calculate-discount`
- `/api/Coupon/my`
- `/api/Coupon/welcome-settings`

### ⭐ Review
- `/api/Review`
- `/api/Review/product/{productId}`
- `/api/Review/can-review/{productId}`

### 🚚 Shipper
- `/api/Shipper/my-shipments`
- `/api/Shipper/shipments/{id}/start-delivery`
- `/api/Shipper/shipments/{id}/deliver`

### 🔔 SignalR Hubs
- `{NEXT_PUBLIC_API_URL}/hubs/notifications`
- `{NEXT_PUBLIC_API_URL}/hubs/shipment-tracking`

## 📁 Cấu Trúc Quan Trọng (Frontend)

```
app/
├── services/           # Gọi API
├── lib/
│   ├── axiosClient.ts
│   └── supabaseClient.ts
├── api/                # Proxy routes
└── shipper/page.tsx    # SignalR usage
```

## 🔧 Biến Môi Trường

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_RAPIDAPI_GOOGLE_PLACES_HOST`
- `NEXT_PUBLIC_RAPIDAPI_GOOGLE_PLACES_KEY`

## ▶️ Chạy Local

```bash
npm install
npm run dev
```

⚠ Backend (.NET) phải chạy để `/api/*` hoạt động. Dev backend thường tại `http://localhost:5048`.

## ⚙️ Ghi Chú Kỹ Thuật

- `axiosClient` tự động inject token, refresh khi 401, và retry requests
- Supabase: client-side cho realtime; server-side admin client cho thao tác nhạy cảm
- API routes trong `app/api`: tránh lộ API key, thực hiện admin-level logic

---

✨ Tổng Kết

Frontend NextShopV2: Modular, Realtime-ready, Role-based UI, Secure (proxy + cookie JWT), tích hợp bản đồ & tracking.
