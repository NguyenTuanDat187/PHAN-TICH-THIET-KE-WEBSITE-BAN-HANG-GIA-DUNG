
export interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface AttributeOption {
  id: number;
  name: string;
  slug: string;
}
