
import {
    ListFilter,
    Plus,
    Pencil,
    Trash2,
    Search,
    RotateCcw,
    SlidersHorizontal,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import DataTable, {
    type DataTableColumn,
} from '../../components/shared/DataTable';
import Pagination from '../../components/shared/Pagination';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { Button } from '../../components/ui/buttons/Button';
import Modal from '../../components/ui/overlays/Modal';

import {
    attributeOptionsMock,
    attributeValuesMock,
} from '../../mocks/attribute-values.mock';

import type {

    AttributeValue,
} from '../../types/attribute-value.types';

const PAGE_SIZE = 7;

const slugify = (text: string) =>
    text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

const inputClass =
    'w-full rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent-primary';

export default function AttributeValuesPage() {
    const [items, setItems] = useState<AttributeValue[]>(
        attributeValuesMock,
    );
    const [search, setSearch] = useState('');
    const [attributeFilter, setAttributeFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<AttributeValue | null>(null);
    const [deleteTarget, setDeleteTarget] =
        useState<AttributeValue | null>(null);
    const [attributeId, setAttributeId] = useState('1');
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const getAttributeName = (id: number) =>
        attributeOptionsMock.find((item) => item.id === id)?.name ??
        'Không xác định';

    const filteredItems = useMemo(() => {
        const keyword = search.trim().toLocaleLowerCase('vi');

        return items.filter((item) => {
            const matchesSearch =
                item.value.toLocaleLowerCase('vi').includes(keyword) ||
                item.slug.toLowerCase().includes(keyword) ||
                getAttributeName(item.attribute_id)
                    .toLocaleLowerCase('vi')
                    .includes(keyword);

            const matchesAttribute =
                attributeFilter === 'all' ||
                item.attribute_id === Number(attributeFilter);

            return matchesSearch && matchesAttribute;
        });
    }, [items, search, attributeFilter]);


    const paginatedItems = filteredItems.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE,
    );

    const openCreate = () => {
        setEditing(null);
        setAttributeId(attributeOptionsMock[0]?.id.toString() ?? '');
        setValue('');
        setError('');
        setModalOpen(true);
    };

    const openEdit = (item: AttributeValue) => {
        setEditing(item);
        setAttributeId(String(item.attribute_id));
        setValue(item.value);
        setError('');
        setModalOpen(true);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const cleanValue = value.trim();
        const selectedAttributeId = Number(attributeId);

        if (!cleanValue || !selectedAttributeId) {
            setError('Vui lòng nhập giá trị và chọn thuộc tính.');
            return;
        }

        const duplicate = items.some(
            (item) =>
                item.attribute_id === selectedAttributeId &&
                item.value.toLocaleLowerCase('vi') ===
                cleanValue.toLocaleLowerCase('vi') &&
                item.id !== editing?.id,
        );

        if (duplicate) {
            setError('Giá trị này đã tồn tại trong thuộc tính đã chọn.');
            return;
        }

        const now = new Date().toISOString().slice(0, 10);

        if (editing) {
            setItems((current) =>
                current.map((item) =>
                    item.id === editing.id
                        ? {
                            ...item,
                            attribute_id: selectedAttributeId,
                            value: cleanValue,
                            slug: slugify(cleanValue),
                            updated_at: now,
                        }
                        : item,
                ),
            );
        } else {
            const newItem: AttributeValue = {
                id: Math.max(0, ...items.map((item) => item.id)) + 1,
                attribute_id: selectedAttributeId,
                value: cleanValue,
                slug: slugify(cleanValue),
                created_at: now,
                updated_at: now,
            };

            setItems((current) => [newItem, ...current]);
            setPage(1);
        }

        setModalOpen(false);
        setEditing(null);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;

        setItems((current) =>
            current.filter((item) => item.id !== deleteTarget.id),
        );

        setDeleteTarget(null);
        setPage(1);
    };

    const columns: DataTableColumn<AttributeValue>[] = [
        {
            key: 'value',
            header: 'Giá trị',
            render: (item) => (
                <div className="min-w-0">
                    <p className="font-medium text-text-primary">{item.value}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                        ID: {item.id}
                    </p>
                </div>
            ),
        },
        {
            key: 'attribute',
            header: 'Thuộc tính',
            render: (item) => (
                <span className="inline-flex rounded-md border border-border-default bg-bg-elevated px-2.5 py-1 text-xs text-text-secondary">
                    {getAttributeName(item.attribute_id)}
                </span>
            ),
        },
        {
            key: 'slug',
            header: 'Slug',
            render: (item) => (
                <span className="break-all font-mono text-xs text-text-secondary">
                    {item.slug}
                </span>
            ),
        },
        {
            key: 'updated',
            header: 'Cập nhật',
            render: (item) => (
                <span className="text-sm text-text-secondary">
                    {item.updated_at}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Thao tác',
            headerClassName: 'text-right',
            className: 'text-right',
            render: (item) => (
                <div className="flex justify-end gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-9! w-9! p-0!"
                        onClick={() => openEdit(item)}
                        aria-label={`Sửa ${item.value}`}
                    >
                        <Pencil size={16} />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-9! w-9! p-0! text-status-danger"
                        onClick={() => setDeleteTarget(item)}
                        aria-label={`Xóa ${item.value}`}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-full bg-bg-app p-4 text-text-primary sm:p-5 xl:p-6">
            <div className="mx-auto flex max-w-[1800px] flex-col gap-4">
                <PageHeader
                    eyebrow="QUẢN LÝ SẢN PHẨM"
                    title="Giá trị thuộc tính"
                    description="Quản lý màu sắc, kích thước, dung tích và các lựa chọn của sản phẩm."
                    actions={
                        <Button onClick={openCreate}>
                            <Plus size={16} />
                            Thêm giá trị
                        </Button>
                    }
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatCard
                        label="Tổng giá trị"
                        value={String(items.length)}
                        icon={ListFilter}
                        accent="primary"
                    />
                    <StatCard
                        label="Thuộc tính đang sử dụng"
                        value={String(new Set(items.map((item) => item.attribute_id)).size)}
                        icon={SlidersHorizontal} accent="cyan"
                    />
                    <StatCard
                        label="Giá trị đang hiển thị"
                        value={String(filteredItems.length)}
                        icon={Search}
                        accent="purple"
                    />
                </div>

                <section className="min-w-0 overflow-hidden rounded-xl border border-border-default bg-bg-surface">
                    <div className="flex flex-col gap-3 border-b border-border-default p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h2 className="font-semibold text-text-primary">
                                Danh sách giá trị
                            </h2>
                            <p className="mt-1 text-xs text-text-muted">
                                Tìm thấy {filteredItems.length} giá trị thuộc tính
                            </p>
                        </div>

                        <div className="flex min-w-0 flex-col gap-2 sm:flex-row xl:w-auto">
                            <div className="relative min-w-0 flex-1">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                                />
                                <input
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Tìm giá trị, slug..."
                                    className={`${inputClass} pl-9`}
                                />
                            </div>

                            <select
                                value={attributeFilter}
                                onChange={(event) => {
                                    setAttributeFilter(event.target.value);
                                    setPage(1);
                                }}
                                className={`${inputClass} sm:w-48`}
                                aria-label="Lọc theo thuộc tính"
                            >
                                <option value="all">Tất cả thuộc tính</option>
                                {attributeOptionsMock.map((attribute) => (
                                    <option key={attribute.id} value={attribute.id}>
                                        {attribute.name}
                                    </option>
                                ))}
                            </select>

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setSearch('');
                                    setAttributeFilter('all');
                                    setPage(1);
                                }}
                                aria-label="Đặt lại bộ lọc"
                            >
                                <RotateCcw size={15} />
                                Đặt lại
                            </Button>
                        </div>
                    </div>

                    <div className="min-w-0 px-3 pb-2 sm:px-4">
                        <DataTable
                            columns={columns}
                            data={paginatedItems}
                            getRowId={(item) => item.id}
                            emptyTitle="Chưa có giá trị thuộc tính"
                            emptyDescription="Thêm giá trị mới hoặc thay đổi bộ lọc tìm kiếm."
                        />
                    </div>

                    <div className="px-3 pb-4 sm:px-4">
                        <Pagination
                            page={page}
                            pageSize={PAGE_SIZE}
                            total={filteredItems.length}
                            onPageChange={setPage}
                            onPageSizeChange={() => setPage(1)}
                            pageSizeOptions={[7]}
                        />
                    </div>
                </section>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Cập nhật giá trị' : 'Thêm giá trị thuộc tính'}
                maxWidth="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Thuộc tính <span className="text-status-danger">*</span>
                        </label>
                        <select
                            value={attributeId}
                            onChange={(event) => setAttributeId(event.target.value)}
                            className={inputClass}
                            required
                        >
                            {attributeOptionsMock.map((attribute) => (
                                <option key={attribute.id} value={attribute.id}>
                                    {attribute.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Giá trị <span className="text-status-danger">*</span>
                        </label>
                        <input
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            className={inputClass}
                            placeholder="Ví dụ: Trắng, Inox, 2 lít..."
                            maxLength={100}
                            required
                            autoFocus
                        />
                        <p className="mt-1.5 text-xs text-text-muted">
                            Slug sẽ được tạo tự động từ giá trị.
                        </p>
                    </div>

                    {value.trim() && (
                        <div className="rounded-lg border border-border-default bg-bg-app p-3">
                            <p className="text-xs text-text-muted">Slug dự kiến</p>
                            <p className="mt-1 break-all font-mono text-sm text-text-secondary">
                                {slugify(value)}
                            </p>
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-status-danger">{error}</p>
                    )}

                    <div className="flex justify-end gap-2 border-t border-border-default pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setModalOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit">
                            {editing ? 'Lưu thay đổi' : 'Thêm giá trị'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Xóa giá trị thuộc tính?"
                description={`Bạn có chắc muốn xóa "${deleteTarget?.value ?? ''}"? Thao tác này chỉ xóa dữ liệu mock trên giao diện hiện tại.`}
                confirmText="Xóa giá trị"
                cancelText="Hủy"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}


