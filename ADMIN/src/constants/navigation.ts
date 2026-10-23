
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  FolderTree,
  Store,
  TicketPercent,
  MessageSquare,
  CreditCard,
  SlidersHorizontal,
  Image,
  Settings,
  ListFilter,
  Layers3,
  Boxes,
  Warehouse,
  BellRing,
  MessageCircle,
  Bell,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  children?: NavigationItem[];
}

export const navigation: NavigationItem[] = [
  // 1. Tổng quan
  {
    id: 'dashboard',
    label: 'Tổng quan',
    path: '/dashboard',
    icon: LayoutDashboard,
  },

  // 2. Bán hàng
  {
    id: 'sales',
    label: 'Bán hàng',
    path: '/orders',
    icon: ShoppingCart,
    children: [
      {
        id: 'orders',
        label: 'Đơn hàng',
        path: '/orders',
        icon: ShoppingCart,
      },
      {
        id: 'payments',
        label: 'Thanh toán',
        path: '/payments',
        icon: CreditCard,
      },
      {
        id: 'promotions',
        label: 'Khuyến mãi',
        path: '/coupons',
        icon: TicketPercent,
      },
    ],
  },

  // 3. Khách hàng
  {
    id: 'customers',
    label: 'Khách hàng',
    path: '/customers',
    icon: Users,
    children: [
      {
        id: 'customer-list',
        label: 'Danh sách khách hàng',
        path: '/customers',
        icon: Users,
      },
    ],
  },

  // 4. Chăm sóc khách hàng
  {
    id: 'customer-care',
    label: 'Chăm sóc khách hàng',
    path: '/reviews',
    icon: MessageSquare,
    children: [
      {
        id: 'product-reviews',
        label: 'Đánh giá sản phẩm',
        path: '/reviews',
        icon: MessageSquare,
      },
      {
        id: 'conversations',
        label: 'Hội thoại khách hàng',
        path: '/conversations',
        icon: MessageCircle,
      },
      {
        id: 'announcements',
        label: 'Thông báo gửi khách',
        path: '/announcements',
        icon: BellRing,
      },
    ],
  },

  // 5. Quản lý sản phẩm
  {
    id: 'products',
    label: 'Quản lý sản phẩm',
    path: '/products',
    icon: Package,
    children: [
      // 5.1. Danh mục và phân loại
      {
        id: 'product-catalog',
        label: 'Danh mục & phân loại',
        path: '/products',
        icon: FolderTree,
        children: [
          {
            id: 'product-list',
            label: 'Danh sách sản phẩm',
            path: '/products',
            icon: Package,
          },
          {
            id: 'categories',
            label: 'Danh mục',
            path: '/categories',
            icon: FolderTree,
          },
          {
            id: 'brands',
            label: 'Thương hiệu',
            path: '/brands',
            icon: Store,
          },
        ],
      },

      // 5.2. Thuộc tính và biến thể
      {
        id: 'product-attributes',
        label: 'Thuộc tính & biến thể',
        path: '/attributes',
        icon: SlidersHorizontal,
        children: [
          {
            id: 'attributes',
            label: 'Thuộc tính sản phẩm',
            path: '/attributes',
            icon: SlidersHorizontal,
          },
          {
            id: 'attribute-values',
            label: 'Giá trị thuộc tính',
            path: '/attribute-values',
            icon: ListFilter,
          },
          {
            id: 'product-variants',
            label: 'Biến thể sản phẩm',
            path: '/product-variants',
            icon: Layers3,
          },
          {
            id: 'variant-attributes',
            label: 'Liên kết thuộc tính biến thể',
            path: '/variant-attributes',
            icon: Boxes,
          },
        ],
      },

      // 5.3. Tài nguyên sản phẩm
      {
        id: 'product-assets',
        label: 'Tài nguyên sản phẩm',
        path: '/product-media',
        icon: Image,
        children: [
          {
            id: 'product-media',
            label: 'Thư viện hình ảnh',
            path: '/product-media',
            icon: Image,
          },
        ],
      },
    ],
  },

  // 6. Kho hàng
  {
    id: 'inventory',
    label: 'Kho hàng',
    path: '/inventory',
    icon: Warehouse,
    children: [
      {
        id: 'inventory-overview',
        label: 'Tồn kho',
        path: '/inventory',
        icon: Boxes,
      },
    ],
  },

  // 7. Hệ thống
  {
    id: 'system',
    label: 'Hệ thống',
    path: '/settings',
    icon: Settings,
    children: [
      {
        id: 'settings',
        label: 'Cài đặt',
        path: '/settings',
        icon: Settings,
      },
      {
        id: 'admin-notifications',
        label: 'Thông báo quản trị',
        path: '/notifications',
        icon: Bell,
      },
    ],
  },
];
