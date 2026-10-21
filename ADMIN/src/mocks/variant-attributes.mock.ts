
import type { VariantAttribute } from '../types/variant-attribute.types';
import { attributesMock } from './attributes.mock';
import { productVariantsMock } from './product-variants.mock';

/**
 * Dữ liệu mẫu liên kết biến thể sản phẩm với thuộc tính.
 *
 * Sử dụng trực tiếp dữ liệu từ:
 * - product-variants.mock.ts
 * - attributes.mock.ts
 *
 * Không tạo lại danh sách sản phẩm, thuộc tính hoặc giá trị thuộc tính.
 */

function createVariantAttribute(
  id: string,
  variantId: number,
  attributeId: string,
  valueId: string,
): VariantAttribute {
  const variant = productVariantsMock.find(
    (item) => item.id === variantId,
  );

  const attribute = attributesMock.find(
    (item) => item.id === attributeId,
  );

  const value = attribute?.values.find(
    (item) => item.id === valueId,
  );

  if (!variant || !attribute || !value) {
    throw new Error(
      `Không tìm thấy dữ liệu liên kết thuộc tính biến thể: ${id}`,
    );
  }

  return {
    id,
    variant_id: String(variant.id),
    attribute_id: attribute.id,
    attribute_value_id: value.id,
    product_name: variant.product_name,
    variant_sku: variant.sku,
    attribute_name: attribute.name,
    attribute_value: value.value,
  };
}

export const variantAttributesMock: VariantAttribute[] = [
  // Nồi chiên không dầu 6L - màu đen
  createVariantAttribute('va-001', 1, 'attr-001', 'val-002'),

  // Nồi chiên không dầu 6L - dung tích 1.5 lít
  createVariantAttribute('va-002', 1, 'attr-002', 'val-008'),

  // Nồi chiên không dầu 6L - màu trắng
  createVariantAttribute('va-003', 2, 'attr-001', 'val-001'),

  // Nồi chiên không dầu 6L - dung tích 1.5 lít
  createVariantAttribute('va-004', 2, 'attr-002', 'val-008'),

  // Bình giữ nhiệt inox - màu xám
  createVariantAttribute('va-005', 3, 'attr-001', 'val-003'),

  // Bình giữ nhiệt inox - chất liệu Inox 304
  createVariantAttribute('va-006', 3, 'attr-003', 'val-010'),

  // Máy xay sinh tố - công suất 500W
  createVariantAttribute('va-007', 4, 'attr-005', 'val-017'),

  // Bộ nồi inox 5 món - chất liệu Inox 304
  createVariantAttribute('va-008', 5, 'attr-003', 'val-010'),

  // Bộ nồi inox 5 món - kích thước lớn
  createVariantAttribute('va-009', 5, 'attr-004', 'val-016'),

  // Ấm siêu tốc - chất liệu Inox 304
  createVariantAttribute('va-010', 6, 'attr-003', 'val-010'),

  // Ấm siêu tốc - dung tích 1.5 lít
  createVariantAttribute('va-011', 6, 'attr-002', 'val-008'),
];

/**
 * Trả về bản sao dữ liệu để trang quản trị thao tác độc lập.
 * Không làm thay đổi trực tiếp dữ liệu mock gốc.
 */
export function getVariantAttributesMock(): VariantAttribute[] {
  return variantAttributesMock.map((item) => ({ ...item }));
}
