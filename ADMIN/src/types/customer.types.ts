
export type CustomerStatus = "active" | "inactive" | "blocked";
export type CustomerSegment = "new" | "regular" | "vip";

export interface Customer {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  gender: "male" | "female" | "other";
  status: CustomerStatus;
  segment: CustomerSegment;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  createdAt: string;
  address: string;
  notes?: string;
}
