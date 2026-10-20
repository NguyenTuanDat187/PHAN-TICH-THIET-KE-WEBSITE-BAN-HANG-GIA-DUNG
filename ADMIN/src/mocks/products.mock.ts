
import type { Product } from '../types/product.types';

export const productsMock: Product[] = [
  {
    id: 'PRD-001',
    name: 'Nồi chiên không dầu Philips HD9270',
    sku: 'PHI-AF-001',
    description:
      'Nồi chiên không dầu dung tích lớn, công nghệ Rapid Air, phù hợp sử dụng trong gia đình.',
    category: 'Đồ gia dụng nhà bếp',
    brand: 'Philips',
    price: 2890000,
    originalPrice: 3290000,
    stock: 24,
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-01',
    updatedAt: '2026-10-18',
  },
  {
    id: 'PRD-002',
    name: 'Máy xay sinh tố Panasonic MX-M200',
    sku: 'PAN-BL-002',
    description:
      'Máy xay sinh tố thiết kế nhỏ gọn, tiện lợi cho nhu cầu sử dụng hằng ngày.',
    category: 'Đồ gia dụng nhà bếp',
    brand: 'Panasonic',
    price: 1190000,
    originalPrice: 1390000,
    stock: 7,
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-03',
    updatedAt: '2026-10-17',
  },
  {
    id: 'PRD-003',
    name: 'Ấm siêu tốc LocknLock EJK341',
    sku: 'LL-KT-003',
    description:
      'Ấm siêu tốc dùng cho gia đình, thiết kế hiện đại và dễ vệ sinh.',
    category: 'Đồ gia dụng nhà bếp',
    brand: 'LocknLock',
    price: 590000,
    originalPrice: 690000,
    stock: 0,
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1594213114663-d94db9b171c8?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-15',
  },
  {
    id: 'PRD-004',
    name: 'Quạt đứng Toshiba F-LSA10',
    sku: 'TOS-FAN-004',
    description:
      'Quạt đứng có nhiều mức gió, phù hợp cho phòng khách và phòng ngủ.',
    category: 'Thiết bị làm mát',
    brand: 'Toshiba',
    price: 1490000,
    originalPrice: 1690000,
    stock: 18,
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1631545806609-2e8e7b6b1f3b?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-06',
    updatedAt: '2026-10-16',
  },
  {
    id: 'PRD-005',
    name: 'Máy lọc không khí Xiaomi 4 Lite',
    sku: 'XIA-AIR-005',
    description:
      'Máy lọc không khí nhỏ gọn, phù hợp với không gian sinh hoạt gia đình.',
    category: 'Thiết bị chăm sóc nhà cửa',
    brand: 'Xiaomi',
    price: 2290000,
    originalPrice: 2590000,
    stock: 4,
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-07',
    updatedAt: '2026-10-19',
  },
  {
    id: 'PRD-006',
    name: 'Nồi cơm điện Sharp KS-181',
    sku: 'SHA-RC-006',
    description:
      'Nồi cơm điện dung tích phù hợp cho gia đình nhỏ, dễ sử dụng và bảo quản.',
    category: 'Đồ gia dụng nhà bếp',
    brand: 'Sharp',
    price: 850000,
    originalPrice: 990000,
    stock: 32,
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-08',
    updatedAt: '2026-10-19',
  },
  {
    id: 'PRD-007',
    name: 'Máy hút bụi cầm tay Deerma DX115C',
    sku: 'DEE-VAC-007',
    description:
      'Máy hút bụi cầm tay phục vụ nhu cầu vệ sinh cơ bản trong gia đình.',
    category: 'Thiết bị chăm sóc nhà cửa',
    brand: 'Deerma',
    price: 650000,
    originalPrice: 790000,
    stock: 0,
    status: 'inactive',
    image:
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-09',
    updatedAt: '2026-10-19',
  },
  {
    id: 'PRD-008',
    name: 'Bàn ủi hơi nước Philips DST0820',
    sku: 'PHI-IR-008',
    description:
      'Bàn ủi hơi nước nhỏ gọn, hỗ trợ chăm sóc quần áo tại nhà.',
    category: 'Thiết bị chăm sóc nhà cửa',
    brand: 'Philips',
    price: 720000,
    originalPrice: 850000,
    stock: 12,
    status: 'draft',
    image:
      'https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-10',
    updatedAt: '2026-10-20',
  },
];

const STORAGE_KEY = 'adminflux_products';

export function getProducts(): Product[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as Product[];
      }
    }
  } catch {
    // Nếu dữ liệu lưu không hợp lệ, sử dụng dữ liệu mẫu.
  }

  return productsMock.map((product) => ({ ...product }));
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    console.error('Không thể lưu danh sách sản phẩm vào localStorage.');
  }
}
