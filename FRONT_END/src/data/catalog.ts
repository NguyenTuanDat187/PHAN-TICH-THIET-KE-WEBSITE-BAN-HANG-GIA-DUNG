import bedroom from "../assets/images/bedroom.png";
import dining from "../assets/images/dining.png";
import grifo from "../assets/images/grifo.png";
import leviosa from "../assets/images/leviosa.png";
import living from "../assets/images/living.png";
import lolito from "../assets/images/lolito.png";
import muggo from "../assets/images/muggo.png";
import pingky from "../assets/images/pingky.png";
import potty from "../assets/images/potty.png";
import respira from "../assets/images/respira.png";
import syltherine from "../assets/images/syltherine.png";

export type Category = "dining" | "living" | "bedroom";

export type Product = {
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: Category;
  badge?: { kind: "sale" | "new"; label: string };
  description: string;
  sku: string;
};

export const categories: { id: Category; label: string; image: string }[] = [
  { id: "dining", label: "Dining", image: dining },
  { id: "living", label: "Living", image: living },
  { id: "bedroom", label: "Bedroom", image: bedroom },
];

export const products: Product[] = [
  {
    slug: "syltherine",
    name: "Syltherine",
    subtitle: "Stylish cafe chair",
    price: 2_500_000,
    originalPrice: 3_500_000,
    image: syltherine,
    category: "dining",
    badge: { kind: "sale", label: "-30%" },
    description:
      "A compact cafe chair with a woven seat and slim legs, made for dining rooms that need a lighter silhouette.",
    sku: "SS001",
  },
  {
    slug: "leviosa",
    name: "Leviosa",
    subtitle: "Stylish cafe chair",
    price: 2_500_000,
    image: leviosa,
    category: "dining",
    description:
      "A cushioned cafe chair with a clean backrest, comfortable enough for long meals.",
    sku: "SS002",
  },
  {
    slug: "lolito",
    name: "Lolito",
    subtitle: "Luxury big sofa",
    price: 7_000_000,
    originalPrice: 14_000_000,
    image: lolito,
    category: "living",
    badge: { kind: "sale", label: "-50%" },
    description:
      "A deep luxury sofa with wide arms and soft upholstery for the living room.",
    sku: "SS003",
  },
  {
    slug: "respira",
    name: "Respira",
    subtitle: "Outdoor bar table and stool",
    price: 500_000,
    image: respira,
    category: "dining",
    badge: { kind: "new", label: "New" },
    description:
      "A small outdoor bar set with a table and matching stool, finished for covered patios.",
    sku: "SS004",
  },
  {
    slug: "grifo",
    name: "Grifo",
    subtitle: "Night lamp",
    price: 1_500_000,
    image: grifo,
    category: "bedroom",
    description: "A bedside lamp with a warm shade and a compact base.",
    sku: "SS005",
  },
  {
    slug: "muggo",
    name: "Muggo",
    subtitle: "Small mug",
    price: 150_000,
    image: muggo,
    category: "dining",
    badge: { kind: "new", label: "New" },
    description: "A small ceramic mug with a comfortable handle.",
    sku: "SS006",
  },
  {
    slug: "pingky",
    name: "Pingky",
    subtitle: "Cute bed set",
    price: 7_000_000,
    originalPrice: 14_000_000,
    image: pingky,
    category: "bedroom",
    badge: { kind: "sale", label: "-50%" },
    description: "A soft bed set with a padded headboard and matching bedding.",
    sku: "SS007",
  },
  {
    slug: "potty",
    name: "Potty",
    subtitle: "Minimalist flower pot",
    price: 500_000,
    image: potty,
    category: "living",
    badge: { kind: "new", label: "New" },
    description: "A minimalist planter for a side table or shelf.",
    sku: "SS008",
  },
];

export function formatPrice(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
