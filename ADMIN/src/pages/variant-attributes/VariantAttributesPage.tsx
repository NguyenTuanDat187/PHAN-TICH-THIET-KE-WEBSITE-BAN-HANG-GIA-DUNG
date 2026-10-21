
import { useMemo, useState } from 'react';
import {
  Activity,
  Layers3,
  Package,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';

import ConfirmDialog from '../../components/shared/ConfirmDialog';
import DataTable, {
  type DataTableColumn,
} from '../../components/shared/DataTable';
import PageHeader from '../../components/shared/PageHeader';
import Pagination from '../../components/shared/Pagination';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import {Button} from '../../components/ui/buttons/Button';

import { attributesMock } from '../../mocks/attributes.mock';
import { productVariantsMock } from '../../mocks/product-variants.mock';
import { variantAttributesMock } from '../../mocks/variant-attributes.mock';

import type {
  VariantAttribute,
  VariantAttributeFormData,
} from '../../types/variant-attribute.types';

import VariantAttributeFormModal from './VariantAttributeFormModal';

const PAGE_SIZE = 7;

const VariantAttributesPage = () => {
  const [records, setRecords] =
    useState<VariantAttribute[]>(variantAttributesMock);

  const [keyword, setKeyword] = useState('');
  const [attributeFilter, setAttributeFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<VariantAttribute | null>(null);

  const [deletingRecord, setDeletingRecord] =
    useState<VariantAttribute | null>(null);

  const filteredRecords = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return records.filter((record) => {
      const matchesKeyword =
        !normalizedKeyword ||
        record.product_name.toLowerCase().includes(normalizedKeyword) ||
        record.variant_sku.toLowerCase().includes(normalizedKeyword) ||
        record.attribute_name.toLowerCase().includes(normalizedKeyword) ||
        record.attribute_value.toLowerCase().includes(normalizedKeyword);

      const matchesAttribute =
        attributeFilter === 'all' ||
        record.attribute_id === attributeFilter;

      return matchesKeyword && matchesAttribute;
    });
  }, [records, keyword, attributeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredRecords.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRecords, currentPage]);

  const assignedVariantCount = new Set(
    records.map((record) => record.variant_id),
  ).size;

  const usedAttributeCount = new Set(
    records.map((record) => record.attribute_id),
  ).size;

  const unassignedVariantCount = productVariantsMock.filter(
    (variant) =>
      !records.some(
        (record) => record.variant_id === String(variant.id),
      ),
  ).length;

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (record: VariantAttribute) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingRecord(null);
  };

  const handleSave = (formData: VariantAttributeFormData) => {
    const variant = productVariantsMock.find(
      (item) => String(item.id) === formData.variant_id,
    );

    const attribute = attributesMock.find(
      (item) => item.id === formData.attribute_id,
    );

    const value = attribute?.values.find(
      (item) => item.id === formData.attribute_value_id,
    );

    if (!variant || !attribute || !value) return;

    if (editingRecord) {
      setRecords((previous) =>
        previous.map((record) =>
          record.id === editingRecord.id
            ? {
                ...record,
                ...formData,
                product_name: variant.product_name,
                variant_sku: variant.sku,
                attribute_name: attribute.name,
                attribute_value: value.value,
              }
            : record,
        ),
      );
    } else {
      const newRecord: VariantAttribute = {
        id: `va-${Date.now()}`,
        ...formData,
        product_name: variant.product_name,
        variant_sku: variant.sku,
        attribute_name: attribute.name,
        attribute_value: value.value,
      };

      setRecords((previous) => [newRecord, ...previous]);
      setPage(1);
    }

    handleCloseForm();
  };

  const handleDelete = () => {
    if (!deletingRecord) return;

    setRecords((previous) =>
      previous.filter((record) => record.id !== deletingRecord.id),
    );

    setDeletingRecord(null);
  };

  const columns: DataTableColumn<VariantAttribute>[] = [
    {
      key: 'product',
      header: 'Sản phẩm / Biến thể',
      render: (record) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-elevated text-text-secondary">
            <Package size={18} />
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">
              {record.product_name}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              SKU: {record.variant_sku}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'attribute',
      header: 'Thuộc tính',
      render: (record) => (
        <span className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-elevated px-2.5 py-1.5 text-sm text-text-secondary">
          <Layers3 size={14} className="text-accent-primary" />
          {record.attribute_name}
        </span>
      ),
    },
    {
      key: 'value',
      header: 'Giá trị',
      render: (record) => (
        <span className="font-medium text-text-primary">
          {record.attribute_value}
        </span>
      ),
    },
 {
  key: 'status',
  header: 'Trạng thái liên kết',
  render: () => (
    <StatusBadge
      status="Đã liên kết"
      variant="success"
    />
  ),
},
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (record) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            
            onClick={() => handleOpenEdit(record)}
            aria-label={`Sửa liên kết ${record.id}`}
          >
            <Pencil size={16} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setDeletingRecord(record)}
            aria-label={`Xóa liên kết ${record.id}`}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full bg-bg-app p-4 text-text-primary sm:p-5 xl:p-6">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-5">
        <PageHeader
          title="Liên kết thuộc tính biến thể"
          description="Quản lý giá trị thuộc tính được gán cho từng biến thể sản phẩm."
          eyebrow="QUẢN LÝ SẢN PHẨM"
          actions={
            <Button
              type="button"
              variant="primary"
              onClick={handleOpenCreate}
            >
              <Plus size={17} />
              Thêm liên kết
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng liên kết"
            value={String(records.length)}
            icon={Layers3}
            accent="primary"
          />

          <StatCard
            label="Biến thể đã gán"
            value={String(assignedVariantCount)}
            icon={Package}
            accent="cyan"
          />

          <StatCard
            label="Thuộc tính đang dùng"
            value={String(usedAttributeCount)}
            icon={Tag}
            accent="purple"
          />

          <StatCard
            label="Biến thể chưa gán"
            value={String(unassignedVariantCount)}
            icon={Activity}
            accent="warning"
          />
        </div>

        <section className="min-w-0 overflow-hidden rounded-xl border border-border-default bg-bg-surface">
          <div className="flex flex-col gap-4 border-b border-border-default p-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-semibold text-text-primary">
                Danh sách liên kết
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Tìm kiếm theo sản phẩm, SKU, thuộc tính hoặc giá trị.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative min-w-0 flex-1 sm:min-w-65 xl:w-[320px]">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="text"
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm sản phẩm, SKU, thuộc tính..."
                  className="w-full rounded-lg border border-border-default bg-bg-app py-2.5 pl-9 pr-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent-primary"
                />
              </div>

              <select
                value={attributeFilter}
                onChange={(event) => {
                  setAttributeFilter(event.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-primary sm:min-w-45"
                aria-label="Lọc theo thuộc tính"
              >
                <option value="all">Tất cả thuộc tính</option>
                {attributesMock.map((attribute) => (
                  <option key={attribute.id} value={attribute.id}>
                    {attribute.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm text-text-secondary">
              Tìm thấy{' '}
              <span className="font-semibold text-text-primary">
                {filteredRecords.length}
              </span>{' '}
              liên kết
            </p>

            {(keyword || attributeFilter !== 'all') && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setKeyword('');
                  setAttributeFilter('all');
                  setPage(1);
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>

          <DataTable
            columns={columns}
            data={paginatedRecords}
            getRowId={(record) => record.id}
            emptyTitle="Chưa có liên kết thuộc tính"
            emptyDescription="Thêm liên kết mới hoặc thay đổi bộ lọc để xem dữ liệu."
          />

          <div className="border-t border-border-default p-4">
            <Pagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              total={filteredRecords.length}
              onPageChange={setPage}
              onPageSizeChange={() => setPage(1)}
              pageSizeOptions={[7]}
            />
          </div>
        </section>
      </div>

      <VariantAttributeFormModal
        open={formOpen}
        initialData={editingRecord}
        existingRecords={records}
        onClose={handleCloseForm}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deletingRecord)}
        title="Xóa liên kết thuộc tính?"
        description={
          deletingRecord
            ? `Bạn có chắc muốn xóa liên kết "${deletingRecord.product_name} — ${deletingRecord.attribute_name}: ${deletingRecord.attribute_value}" không?`
            : ''
        }
        confirmText="Xóa liên kết"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeletingRecord(null)}
      />
    </div>
  );
};

export default VariantAttributesPage;
