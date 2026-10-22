import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FeatureBar } from "../../components/layout/FeatureBar.tsx";
import { PageBanner } from "../../components/layout/PageBanner.tsx";
import { ProductCard } from "../../components/product/ProductCard.tsx";
import { products, type Category } from "../../data/catalog.ts";
import styles from "./ProductsPage.module.css";

const categories = ["all", "dining", "living", "bedroom"] as const;

export function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const query = (params.get("q") ?? "").trim().toLowerCase();
  const category = params.get("category") ?? "all";
  const sort = params.get("sort") ?? "default";

  const visible = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.subtitle.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
    if (sort === "price-asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...filtered].sort((a, b) => b.price - a.price);
    if (sort === "name") return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [category, query, sort]);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === "all" || value === "default") next.delete(key);
    else next.set(key, value);
    setParams(next);
  }

  return (
    <>
      <PageBanner title="Shop" />
      <div className={styles.toolbar}>
        <div className="wrap">
          <div className={styles.filters}>
            <label>
              Category{" "}
              <select
                value={categories.includes(category as (typeof categories)[number]) ? category : "all"}
                onChange={(event) => update("category", event.target.value)}
              >
                <option value="all">All</option>
                <option value="dining">Dining</option>
                <option value="living">Living</option>
                <option value="bedroom">Bedroom</option>
              </select>
            </label>
            <span>
              Showing {visible.length} of {products.length} results
              {query ? ` for “${query}”` : ""}
            </span>
          </div>
          <label>
            Sort by{" "}
            <select value={sort} onChange={(event) => update("sort", event.target.value)}>
              <option value="default">Default</option>
              <option value="name">Name</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
            </select>
          </label>
        </div>
      </div>
      <div className={`wrap ${styles.grid}`}>
        {visible.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      <FeatureBar />
    </>
  );
}

export type { Category };
