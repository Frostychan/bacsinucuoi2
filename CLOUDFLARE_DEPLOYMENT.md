# Hướng Dẫn Host Website MedCare Plus Lên Cloudflare Pages

Dự án đã được cấu hình sẵn sàng 100% để triển khai lên **Cloudflare Pages** (hỗ trợ cả giao diện tĩnh và backend serverless Edge Functions `/functions/api/*`).

---

## Cách 1: Kết nối trực tiếp qua GitHub / GitLab (Khuyên dùng - Tự động cập nhật)

1. **Đăng nhập vào Cloudflare:**
   - Truy cập: [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
   - Vào menu bên trái chọn **Workers & Pages** -> Bấm **Create Application** -> Chọn tab **Pages** -> Bấm **Connect to Git**.

2. **Chọn Repository:**
   - Cấp quyền cho Cloudflare kết nối với kho mã nguồn chứa dự án này.

3. **Cài đặt thông số Build (Build settings):**
   - **Framework preset:** `Vite` (hoặc `None`)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** Để trống (hoặc `/`)

4. **Cấu hình biến môi trường (Environment Variables):**
   - Bấm vào mục **Environment variables (advanced)** -> Thêm biến:
     - `GEMINI_API_KEY`: *(Dán khóa Gemini API Key của bạn để kích hoạt AI Chat)*

5. **Bấm "Save and Deploy":**
   - Cloudflare sẽ tự động build và cấp cho bạn một tên miền miễn phí dạng:  
     `https://medcare-plus.pages.dev`
   - Hỗ trợ SSL/HTTPS miễn phí và có thể gắn tên miền riêng (`custom domain`) không giới hạn.

---

## Cách 2: Triển khai nhanh bằng dòng lệnh (Wrangler CLI)

Nếu bạn muốn deploy trực tiếp từ máy tính lên Cloudflare trong 1 phút:

```bash
# 1. Cài đặt các thư viện và build dự án
npm install
npm run build

# 2. Đăng nhập vào Cloudflare (chỉ cần làm lần đầu)
npx wrangler login

# 3. Triển khai thư mục dist lên Cloudflare Pages
npx wrangler pages deploy dist --project-name=medcare-plus
```

---

## Các tệp tin cấu hình đã được chuẩn bị sẵn trong mã nguồn:
- `public/_redirects`: Định tuyến SPA chuẩn để khi refresh trang không bị lỗi 404.
- `functions/api/chat.ts`: Serverless Edge Function cho AI tư vấn triệu chứng.
- `functions/api/health.ts`: Endpoint kiểm tra trạng thái hoạt động trên Cloudflare.
- `wrangler.toml`: Cấu hình tự động cho công cụ Wrangler.
