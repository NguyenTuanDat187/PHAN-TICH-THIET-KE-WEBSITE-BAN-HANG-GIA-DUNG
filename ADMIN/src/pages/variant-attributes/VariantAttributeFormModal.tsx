
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, Layers3, Package, Tag } from 'lucide-react';

import {Button} from '../../components/ui/buttons/Button';
import Modal from '../../components/ui/overlays/Modal';

import { attributesMock } from '../../mocks/attributes.mock';
import { productVariantsMock } from '../../mocks/product-variants.mock';

import type {
  VariantAttribute,
  VariantAttributeFormData,
} from '../../types/variant-attribute.types';

interface VariantAttributeFormModalProps {
  open: boolean;
  initialData?: VariantAttribute | null;
  existingRecords: VariantAttribute[];
  onClose: () => void;
  onSubmit: (data: VariantAttributeFormData) => void;
}

const inputClassName =
  'w-full rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent-primary disabled:cursor-not-allowed disabled:opacity-50';

const labelClassName =
  'mb-2 block text-sm font-medium text-text-secondary';

const VariantAttributeFormModal = ({
  open,
  initialData,
  existingRecords,
  onClose,
  onSubmit,
}: VariantAttributeFormModalProps) => {
  const [variantId, setVariantId] = useState('');
  const [attributeId, setAttributeId] = useState('');
  const [attributeValueId, setAttributeValueId] = useState('');
  const [error, setError] = useState('');

  const selectedAttribute = useMemo(
    () => attributesMock.find((item) => item.id === attributeId),
    [attributeId],
  );

  const availableValues = selectedAttribute?.values ?? [];

  const selectedVariant = useMemo(
    () =>
      productVariantsMock.find(
        (item) => String(item.id) === variantId,
      ),
    [variantId],
  );

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (!open) return;

    setVariantId(initialData?.variant_id ?? '');
    setAttributeId(initialData?.attribute_id ?? '');
    setAttributeValueId(initialData?.attribute_value_id ?? '');
    setError('');
  }, [open, initialData]);

  useEffect(() => {
    if (
      attributeValueId &&
      !availableValues.some((item) => item.id === attributeValueId)
    ) {
      setAttributeValueId('');
    }
  }, [attributeId, attributeValueId, availableValues]);

  const handleAttributeChange = (value: string) => {
    setAttributeId(value);
    setAttributeValueId('');
    setError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!variantId || !attributeId || !attributeValueId) {
      setError('Vui lòng chọn đầy đủ biến thể, thuộc tính và giá trị.');
      return;
    }

    const attribute = attributesMock.find(
      (item) => item.id === attributeId,
    );

    const valueExists = attribute?.values.some(
      (item) => item.id === attributeValueId,
    );

    if (!selectedVariant || !attribute || !valueExists) {
      setError('Dữ liệu lựa chọn không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    const duplicate = existingRecords.some(
      (item) =>
        item.variant_id === variantId &&
        item.attribute_id === attributeId &&
        item.id !== initialData?.id,
    );

    if (duplicate) {
      setError(
        'Biến thể này đã có thuộc tính được chọn. Vui lòng chọn thuộc tính khác.',
      );
      return;
    }

    onSubmit({
      variant_id: variantId,
      attribute_id: attributeId,
      attribute_value_id: attributeValueId,
    });
  };

  return (
  <Modal
  open={open}
  onClose={onClose}
  title={isEditing ? 'Chỉnh sửa liên kết thuộc tính' : 'Thêm liên kết thuộc tính'}
  maxWidth="lg"
>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-border-default bg-bg-elevated p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
              <Layers3 size={20} />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-text-primary">
                Liên kết biến thể với thuộc tính
              </h3>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                Chọn biến thể sản phẩm, thuộc tính tương ứng và giá trị cụ thể
                để xác định đặc điểm của biến thể.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="variant_id" className={labelClassName}>
            <span className="inline-flex items-center gap-2">
              <Package size={15} />
              Biến thể sản phẩm
              <span className="text-red-400">*</span>
            </span>
          </label>

          <select
            id="variant_id"
            value={variantId}
            onChange={(event) => {
              setVariantId(event.target.value);
              setError('');
            }}
            className={inputClassName}
            required
          >
            <option value="">-- Chọn biến thể sản phẩm --</option>

            {productVariantsMock.map((variant) => (
              <option key={variant.id} value={String(variant.id)}>
                {variant.product_name} — {variant.sku}
              </option>
            ))}
          </select>

          {selectedVariant && (
            <div className="mt-2 rounded-lg border border-border-default bg-bg-app px-3 py-2">
              <div className="text-sm font-medium text-text-primary">
                {selectedVariant.product_name}
              </div>
              <div className="mt-1 text-xs text-text-muted">
                SKU: {selectedVariant.sku}
                {' · '}
                Tồn kho: {selectedVariant.stock_quantity}
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="attribute_id" className={labelClassName}>
            <span className="inline-flex items-center gap-2">
              <Layers3 size={15} />
              Thuộc tính
              <span className="text-red-400">*</span>
            </span>
          </label>

          <select
            id="attribute_id"
            value={attributeId}
            onChange={(event) => handleAttributeChange(event.target.value)}
            className={inputClassName}
            required
          >
            <option value="">-- Chọn thuộc tính --</option>

            {attributesMock.map((attribute) => (
              <option key={attribute.id} value={attribute.id}>
                {attribute.name}
              </option>
            ))}
          </select>

          <p className="mt-1.5 text-xs text-text-muted">
            Mỗi biến thể chỉ được liên kết một lần với cùng một thuộc tính.
          </p>
        </div>

        <div>
          <label htmlFor="attribute_value_id" className={labelClassName}>
            <span className="inline-flex items-center gap-2">
              <Tag size={15} />
              Giá trị thuộc tính
              <span className="text-red-400">*</span>
            </span>
          </label>

          <select
            id="attribute_value_id"
            value={attributeValueId}
            onChange={(event) => {
              setAttributeValueId(event.target.value);
              setError('');
            }}
            className={inputClassName}
            disabled={!attributeId || availableValues.length === 0}
            required
          >
            <option value="">-- Chọn giá trị --</option>

            {availableValues.map((value) => (
              <option key={value.id} value={value.id}>
                {value.value}
              </option>
            ))}
          </select>

          {!attributeId && (
            <p className="mt-1.5 text-xs text-text-muted">
              Hãy chọn thuộc tính trước để hiển thị các giá trị tương ứng.
            </p>
          )}

          {attributeId && availableValues.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-400">
              Thuộc tính này chưa có giá trị nào.
            </p>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-3 text-sm text-red-400"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-border-default pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Hủy
          </Button>

          <Button type="submit" variant="primary">
            {isEditing ? 'Lưu thay đổi' : 'Thêm liên kết'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VariantAttributeFormModal;
