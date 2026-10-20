
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  FolderTree,
  Store,
  TicketPercent,
  MessageSquare,
  Warehouse,
  CreditCard,
  SlidersHorizontal,
  Image,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  children?: NavigationItem[];
}

export const navigation: NavigationItem[] = [
  // 1. Tổng quan
  {
    label: 'Tổng quan',
    path: '/dashboard',
    icon: LayoutDashboard,
  },

  // 2. Bán hàng
  {
    label: 'Đơn hàng',
    path: '/orders',
    icon: ShoppingCart,
  },
  {
    label: 'Thanh toán',
    path: '/payments',
    icon: CreditCard,
  },
  {
    label: 'Mã giảm giá',
    path: '/coupons',
    icon: TicketPercent,
  },

  // 3. Quản lý khách hàng
  {
    label: 'Khách hàng',
    path: '/customers',
    icon: Users,
  },

  // 4. Quản lý sản phẩm
  {
    label: 'Sản phẩm',
    path: '/products',
    icon: Package,
  },
  {
    label: 'Danh mục',
    path: '/categories',
    icon: FolderTree,
  },
  {
    label: 'Thương hiệu',
    path: '/brands',
    icon: Store,
  },
  {
    label: 'Thuộc tính sản phẩm',
    path: '/attributes',
    icon: SlidersHorizontal,
  },
  {
    label: 'Thư viện hình ảnh',
    path: '/product-media',
    icon: Image,
  },

  // 5. Kho hàng
  {
    label: 'Kho hàng',
    path: '/inventory',
    icon: Warehouse,
  },

  // 6. Tương tác khách hàng
  {
    label: 'Đánh giá sản phẩm',
    path: '/reviews',
    icon: MessageSquare,
  },
  // 8. Hệ thống
  {
    label: 'Cài đặt',
    path: '/settings',
    icon: Settings,
  },
];
