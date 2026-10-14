# Button

Nút bấm dùng chung. Màu có sẵn gồm `primary`, `success` và `error`.

## Cách dùng

```tsx
import { Button } from "./components/common";

<Button variant="primary">Lưu</Button>
<Button variant="success">Đã xác nhận</Button>
<Button variant="error">Xóa</Button>
```

Không truyền `variant` thì nút dùng `primary`.

| variant | Màu | Dùng khi |
| --- | --- | --- |
| `primary` | blue | hành động chính |
| `success` | xanh xác nhận | thao tác đã thành công hoặc xác nhận |
| `error` | đỏ | thao tác nguy hiểm, xóa, hủy |

Nút còn nhận `size` (`sm`, `md`, `lg`), `fullWidth`, `loading`, `leftIcon` và `rightIcon`. `loading` khóa nút và hiện vòng xoay.
