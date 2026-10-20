
export type ProductStatus = 'active' | 'inactive' | 'draft';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  stock: number;
  status: ProductStatus;
  image: string;
  createdAt: string;
  updatedAt: string;
}
