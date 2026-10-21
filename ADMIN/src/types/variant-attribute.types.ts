
/**
 * Một bản ghi liên kết biến thể sản phẩm với thuộc tính và giá trị thuộc tính.
 *
 * Ví dụ:
 * Biến thể: Áo thun ABC - Đỏ - Size M
 * Thuộc tính: Màu sắc
 * Giá trị: Đỏ
 *
 * Mỗi biến thể chỉ được có một giá trị cho mỗi thuộc tính.
 */

export interface VariantAttribute {
  id: string;
  variant_id: string;
  attribute_id: string;
  attribute_value_id: string;

  // Các trường bổ sung để hiển thị trong giao diện quản trị.
  // Đây là dữ liệu hiển thị, không phải cột bắt buộc trong bảng liên kết.
  product_name: string;
  variant_sku: string;
  attribute_name: string;
  attribute_value: string;
}

export type VariantAttributeFormData = Pick<
  VariantAttribute,
  'variant_id' | 'attribute_id' | 'attribute_value_id'
>;

export interface VariantAttributeFilters {
  keyword: string;
  attribute_id: string;
  status: 'all' | 'assigned' | 'unassigned';
}

export type VariantAttributeStatus = 'assigned' | 'unassigned';
