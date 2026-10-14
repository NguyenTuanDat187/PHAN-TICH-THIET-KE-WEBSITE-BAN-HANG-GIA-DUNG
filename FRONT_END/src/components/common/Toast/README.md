# Toast

Thông báo nổi dùng `react-hot-toast`. Có ba kiểu: `success`, `warning`, `error`. Mỗi kiểu có màu nền, màu chữ và icon riêng.

## Gắn vào ứng dụng

Render `ToastProvider` một lần, cạnh gốc của app:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastProvider } from "./components/common";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <ToastProvider />
  </StrictMode>,
);
```

## Hiện toast

```tsx
import { showToast } from "./components/common";

showToast("Đã lưu thành công.", "success");
showToast("Vui lòng kiểm tra lại thông tin.", "warning");
showToast("Không thể hoàn tất thao tác.", "error");
```

`showToast` trả về id của toast. Không truyền kiểu thì mặc định là `success`. Toast tự đóng sau 4 giây. Người dùng cũng có thể bấm nút đóng.

| Kiểu | Icon | Màu |
| --- | --- | --- |
| `success` | dấu tích trong vòng tròn | xanh |
| `warning` | tam giác cảnh báo | cam |
| `error` | dấu X trong vòng tròn | đỏ |
