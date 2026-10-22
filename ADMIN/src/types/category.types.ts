
export type CategoryStatus = 'active' | 'inactive';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  productCount: number;
  status: CategoryStatus;
  createdAt: string;
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  status: CategoryStatus;
}
