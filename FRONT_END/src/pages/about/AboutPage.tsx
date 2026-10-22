import { PageBanner } from "../../components/layout/PageBanner.tsx";
import { FeatureBar } from "../../components/layout/FeatureBar.tsx";
import hero from "../../assets/images/hero.png";

export function AboutPage() {
  return (
    <>
      <PageBanner title="About" />
      <section className="wrap" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, padding: "64px 0", alignItems: "center" }}>
        <img src={hero} alt="Furniro showroom" style={{ width: "100%", height: 420, objectFit: "cover" }} />
        <div>
          <h2>Furniro</h2>
          <p>
            Furniro makes furniture for dining rooms, living rooms, and bedrooms. Each piece is built from solid materials, finished for everyday use, and shipped with a warranty.
          </p>
          <p>
            Visit the shop to browse the current collection, or contact the studio if you need help choosing a size.
          </p>
        </div>
      </section>
      <FeatureBar />
    </>
  );
}
