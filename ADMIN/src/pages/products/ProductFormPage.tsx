import {
  ArrowLeft,
  ImagePlus,
  Package,
  Save,
  Tag,
  Warehouse,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import PageHeader from '../../components/shared/PageHeader';
import { Button } from '../../components/ui/buttons/Button';
import { getProducts, saveProducts } from '../../mocks/products.mock';
import type { Product, ProductStatus } from '../../types/product.types';

const initialForm = {
  name: '',
  sku: '',
  description: '',
  category: '',
  brand: '',
  price: '',
  originalPrice: '',
  stock: '',
  status: 'draft' as ProductStatus,
  image: '',
};

type ProductFormValues = typeof initialForm;

const fieldClass =
  'mt-2.5 block w-full min-w-0 rounded-xl border border-border-default bg-bg-elevated px-4 py-3 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-muted hover:border-border-strong focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15';

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Package;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-border-default bg-bg-surface">
      <div className="flex items-start gap-3 border-b border-border-default px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text-primary">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6 lg:p-7">{children}</div>
    </section>
  );
}

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-text-secondary">
      <span>{children}</span>
      {hint && (
        <span className="text-xs font-normal text-text-muted">{hint}</span>
      )}
    </span>
  );
}

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<ProductFormValues>(initialForm);
  const [error, setError] = useState('');

  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (!id) {
      setForm(initialForm);
      return;
    }

    const product = getProducts().find((item) => item.id === id);

    if (!product) {
      navigate('/products', { replace: true });
      return;
    }

    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: String(product.price),
      originalPrice: String(product.originalPrice),
      stock: String(product.stock),
      status: product.status,
      image: product.image,
    });

    setPreviewError(false);
  }, [id, navigate]);

  const updateField = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');

    if (key === 'image') {
      setPreviewError(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const name = form.name.trim();
    const sku = form.sku.trim();
    const category = form.category.trim();
    const brand = form.brand.trim();
    const price = Number(form.price);
    const originalPrice =
      form.originalPrice.trim() === ''
        ? price
        : Number(form.originalPrice);
    const stock = Number(form.stock);

    if (!name || !sku || !category || !brand) {
      setError('M cần nhập đầy đủ tên sản phẩm, SKU, danh mục và thương hiệu.');
      return;
    }

    if (
      form.price.trim() === '' ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(originalPrice) ||
      originalPrice < 0
    ) {
      setError('Giá sản phẩm phải là số hợp lệ và không được âm.');
      return;
    }

    if (
      form.stock.trim() === '' ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError('Tồn kho phải là số nguyên không âm.');
      return;
    }

    if (
      originalPrice > 0 &&
      price > originalPrice
    ) {
      setError('Giá bán không nên cao hơn giá gốc. M hãy kiểm tra lại.');
      return;
    }

    const products = getProducts();

    const duplicateSku = products.some(
      (product) =>
        product.sku.toLowerCase() === sku.toLowerCase() &&
        product.id !== id,
    );

    if (duplicateSku) {
      setError('SKU này đã tồn tại. M hãy nhập một SKU khác.');
      return;
    }

    const now = new Date().toISOString().slice(0, 10);
    const normalizedImage = form.image.trim();

    if (isEditing && id) {
      const existing = products.find((product) => product.id === id);

      if (!existing) {
        setError('Không tìm thấy sản phẩm cần chỉnh sửa.');
        return;
      }

      const updatedProduct: Product = {
        ...existing,
        ...form,
        name,
        sku,
        category,
        brand,
        image: normalizedImage,
        price,
        originalPrice,
        stock,
        updatedAt: now,
      };

      saveProducts(
        products.map((product) =>
          product.id === id ? updatedProduct : product,
        ),
      );

      navigate(`/products/${id}`);
      return;
    }

    const newProduct: Product = {
      ...form,
      id: `PRD-${Date.now()}`,
      name,
      sku,
      category,
      brand,
      image: normalizedImage,
      price,
      originalPrice,
      stock,
      createdAt: now,
      updatedAt: now,
    };

    saveProducts([newProduct, ...products]);
    navigate(`/products/${newProduct.id}`);
  };

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1800px] space-y-6 p-4 pb-8 sm:space-y-7 sm:p-5 sm:pb-8 xl:p-6 xl:pb-10">
      <PageHeader
        title={isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
        description={
          isEditing
            ? 'Cập nhật thông tin, giá bán và tình trạng kinh doanh của sản phẩm.'
            : 'Hoàn thiện thông tin bên dưới để thêm sản phẩm vào cửa hàng.'
        }
        eyebrow={isEditing ? 'PRODUCT / EDIT' : 'PRODUCT / CREATE'}
        actions={
          <Link to="/products" className="inline-flex w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="min-w-0 space-y-5 sm:space-y-6">
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)] xl:gap-6">
          <div className="min-w-0 space-y-5 sm:space-y-6">
            <FormSection
              icon={Package}
              title="Thông tin cơ bản"
              description="Thông tin nhận diện và phân loại sản phẩm."
            >
              <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
                <label className="block min-w-0">
                  <FieldLabel>Tên sản phẩm *</FieldLabel>
                  <input
                    className={fieldClass}
                    value={form.name}
                    onChange={(event) =>
                      updateField('name', event.target.value)
                    }
                    placeholder="Nhập tên sản phẩm"
                    autoComplete="off"
                    required
                  />
                </label>

                <label className="block min-w-0">
                  <FieldLabel>SKU *</FieldLabel>
                  <input
                    className={fieldClass}
                    value={form.sku}
                    onChange={(event) =>
                      updateField('sku', event.target.value)
                    }
                    placeholder="VD: PHI-AF-009"
                    autoComplete="off"
                    required
                  />
                </label>

                <label className="block min-w-0">
                  <FieldLabel>Danh mục *</FieldLabel>
                  <input
                    className={fieldClass}
                    value={form.category}
                    onChange={(event) =>
                      updateField('category', event.target.value)
                    }
                    placeholder="Nhập danh mục sản phẩm"
                    required
                  />
                </label>

                <label className="block min-w-0">
                  <FieldLabel>Thương hiệu *</FieldLabel>
                  <input
                    className={fieldClass}
                    value={form.brand}
                    onChange={(event) =>
                      updateField('brand', event.target.value)
                    }
                    placeholder="Nhập tên thương hiệu"
                    required
                  />
                </label>

                <label className="block min-w-0 md:col-span-2">
                  <FieldLabel>Mô tả sản phẩm</FieldLabel>
                  <textarea
                    className={`${fieldClass} min-h-36 resize-y`}
                    value={form.description}
                    onChange={(event) =>
                      updateField('description', event.target.value)
                    }
                    placeholder="Mô tả đặc điểm, công dụng và thông tin nổi bật của sản phẩm..."
                    rows={5}
                  />
                  <span className="mt-2 block text-xs leading-5 text-text-muted">
                    Mô tả rõ ràng giúp việc quản lý và nhận diện sản phẩm dễ
                    dàng hơn.
                  </span>
                </label>
              </div>
            </FormSection>

            <FormSection
              icon={Warehouse}
              title="Giá bán và tồn kho"
              description="Thiết lập giá sản phẩm và số lượng hàng hiện có."
            >
              <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
                <label className="block min-w-0">
                  <FieldLabel>Giá bán (VNĐ) *</FieldLabel>
                  <input
                    className={fieldClass}
                    type="number"
                    min="0"
                    step="1000"
                    value={form.price}
                    onChange={(event) =>
                      updateField('price', event.target.value)
                    }
                    placeholder="VD: 250000"
                    required
                  />
                  <span className="mt-2 block text-xs text-text-muted">
                    Giá bán hiện tại của sản phẩm.
                  </span>
                </label>

                <label className="block min-w-0">
                  <FieldLabel>Giá gốc (VNĐ)</FieldLabel>
                  <input
                    className={fieldClass}
                    type="number"
                    min="0"
                    step="1000"
                    value={form.originalPrice}
                    onChange={(event) =>
                      updateField('originalPrice', event.target.value)
                    }
                    placeholder="Để trống nếu bằng giá bán"
                  />
                  <span className="mt-2 block text-xs text-text-muted">
                    Dùng để thể hiện mức giá trước khuyến mãi.
                  </span>
                </label>

                <label className="block min-w-0 md:col-span-2">
                  <FieldLabel>Số lượng tồn kho *</FieldLabel>
                  <input
                    className={fieldClass}
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(event) =>
                      updateField('stock', event.target.value)
                    }
                    placeholder="Nhập số lượng tồn kho"
                    required
                  />
                  <span className="mt-2 block text-xs text-text-muted">
                    Nhập số nguyên từ 0 trở lên.
                  </span>
                </label>
              </div>
            </FormSection>
          </div>

          <aside className="min-w-0 space-y-5 sm:space-y-6">
            <FormSection
              icon={ImagePlus}
              title="Hình ảnh sản phẩm"
              description="Thêm đường dẫn ảnh và kiểm tra hình xem trước."
            >
              <label className="block min-w-0">
                <FieldLabel>Đường dẫn ảnh</FieldLabel>
                <input
                  className={fieldClass}
                  type="url"
                  value={form.image}
                  onChange={(event) =>
                    updateField('image', event.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </label>

              <div className="mt-5 flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border-strong bg-bg-elevated/50 p-4 sm:min-h-64">
                {form.image.trim() && !previewError ? (
                  <img
                    src={form.image}
                    alt="Xem trước sản phẩm"
                    className="max-h-64 w-full object-contain"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center px-4 py-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border-default bg-bg-surface text-text-muted">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-text-secondary">
                      {previewError ? 'Không thể tải hình ảnh' : 'Chưa có hình ảnh'}
                    </p>
                    <p className="mt-1 max-w-52 text-xs leading-5 text-text-muted">
                      {previewError
                        ? 'Kiểm tra lại đường dẫn ảnh rồi thử lại.'
                        : 'Nhập URL ảnh để xem trước tại đây.'}
                    </p>
                  </div>
                )}
              </div>
            </FormSection>

            <FormSection
              icon={Tag}
              title="Trạng thái"
              description="Chọn trạng thái hiển thị của sản phẩm."
            >
              <label className="block min-w-0">
                <FieldLabel>Trạng thái kinh doanh</FieldLabel>
                <select
                  className={fieldClass}
                  value={form.status}
                  onChange={(event) =>
                    updateField('status', event.target.value as ProductStatus)
                  }
                >
                  <option value="draft">Bản nháp</option>
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </label>

              <div className="mt-4 rounded-xl border border-border-default bg-bg-elevated/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  Trạng thái đã chọn
                </p>
                <p className="mt-2 text-sm font-semibold text-text-primary">
                  {form.status === 'active'
                    ? 'Đang bán'
                    : form.status === 'inactive'
                      ? 'Ngừng bán'
                      : 'Bản nháp'}
                </p>
                <p className="mt-1 text-xs leading-5 text-text-muted">
                  {form.status === 'active'
                    ? 'Sản phẩm được đánh dấu đang kinh doanh.'
                    : form.status === 'inactive'
                      ? 'Sản phẩm được đánh dấu ngừng kinh doanh.'
                      : 'Sản phẩm được lưu dưới dạng bản nháp.'}
                </p>
              </div>
            </FormSection>
          </aside>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-400"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-border-default bg-bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-xs leading-5 text-text-muted">
            Các trường có dấu * là bắt buộc.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Link to="/products" className="inline-flex">
              <Button variant="secondary" className="w-full sm:w-auto">
                Hủy
              </Button>
            </Link>

            <Button variant="primary" type="submit" className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}