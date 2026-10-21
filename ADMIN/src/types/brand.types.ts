export type BrandStatus = 'active' | 'inactive';

export interface Brand {
  logoUrl: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  website: string;
  productCount: number;
  status: BrandStatus;
  createdAt: string;
  updatedAt: string;
}