import { useMemo, useState } from "react";
import styles from "./AdminProductsPage.module.css";
import ProductModal from "../../components/layout/admin/ProductModal/ProductModal";
import type { ProductFormData } from "../../components/layout/admin/ProductModal/ProductModal";
type ProductStatus = "Activo" | "Inactivo";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image?: string;
  productType: "Suplementación" | "Ropa";
  supplementFlavor?: string;
  supplementPresentation?: string;
  supplementServings?: string;
  apparelSize?: string;
  apparelColor?: string;
  apparelMaterial?: string;
};

const initialProducts: Product[] = [
  {
    id: "P-001",
    name: "Proteína Whey Gold Standard",
    category: "Proteína",
    price: 899,
    stock: 12,
    status: "Activo",
    image: "https://via.placeholder.com/52",
    productType: "Suplementación",
    supplementFlavor: "Vainilla",
    supplementPresentation: "2.2 kg",
    supplementServings: "73 servicios",
  },
  {
    id: "P-002",
    name: "Creatina Monohidratada",
    category: "Creatina",
    price: 599,
    stock: 8,
    status: "Activo",
    image: "https://via.placeholder.com/52",
    productType: "Suplementación",
    supplementFlavor: "Sin sabor",
    supplementPresentation: "300 g",
    supplementServings: "60 servicios",
  },
  {
    id: "P-003",
    name: "Pre-Entreno Explosive",
    category: "Pre-entreno",
    price: 699,
    stock: 0,
    status: "Inactivo",
    image: "https://via.placeholder.com/52",
    productType: "Suplementación",
    supplementFlavor: "Frutos rojos",
    supplementPresentation: "360 g",
    supplementServings: "30 servicios",
  },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [sort, setSort] = useState<"name" | "price" | "stock">("name");

  // Modal
  const [openModal, setOpenModal] = useState(false);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["Todos", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = products.filter((p) => {
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);

      const matchCat = category === "Todos" || p.category === category;
      return matchQuery && matchCat;
    });

    list = list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "price") return a.price - b.price;
      return a.stock - b.stock;
    });

    return list;
  }, [products, query, category, sort]);

  const onDelete = (id: string) => {
    const ok = confirm(`¿Eliminar producto ${id}?`);
    if (!ok) return;

    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const nextId = () => {
    // Genera ID tipo P-004, P-005...
    const nums = products
      .map((p) => Number(p.id.replace("P-", "")))
      .filter((n) => Number.isFinite(n));
    const max = nums.length ? Math.max(...nums) : 0;
    const n = max + 1;
    return `P-${String(n).padStart(3, "0")}`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Productos</h1>
          <p className={styles.subtitle}>
            Gestiona el catálogo de Titanium Sport Gym.
          </p>
        </div>

        <button
          className={styles.primaryBtn}
          onClick={() => setOpenModal(true)}
        >
          + Nuevo producto
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            placeholder="Buscar por ID o nombre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as "name" | "price" | "stock")
            }
          >
            <option value="name">Ordenar: Nombre</option>
            <option value="price">Ordenar: Precio</option>
            <option value="stock">Ordenar: Stock</option>
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th className={styles.thRight}>Precio</th>
                <th className={styles.thRight}>Stock</th>
                <th>Estado</th>
                <th className={styles.thRight}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.productCell}>
                      <img
                        className={styles.productImg}
                        src={p.image || "https://via.placeholder.com/52"}
                        alt={p.name}
                      />
                      <div>
                        <div className={styles.productName}>{p.name}</div>
                        <div className={styles.productId}>{p.id}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={styles.tag}>{p.category}</span>
                  </td>

                  <td className={styles.tdRight}>${p.price.toFixed(2)} MXN</td>
                  <td className={styles.tdRight}>
                    {p.stock > 0 ? (
                      p.stock
                    ) : (
                      <span className={styles.out}>Sin stock</span>
                    )}
                  </td>

                  <td>
                    <span
                      className={`${styles.status} ${
                        p.status === "Activo"
                          ? styles.statusOn
                          : styles.statusOff
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className={styles.tdRight}>
                    <div className={styles.actions}>
                      {/* Editar lo hacemos después con el mismo modal */}
                      <button
                        className={styles.btnGhost}
                        disabled
                        title="Luego lo hacemos"
                      >
                        Editar
                      </button>

                      <button
                        className={styles.btnDanger}
                        onClick={() => onDelete(p.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    No hay productos con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <span className={styles.count}>
            Mostrando <b>{filtered.length}</b> productos
          </span>
        </div>
      </div>

      {/* ✅ MODAL NUEVO PRODUCTO */}
      <ProductModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={(data: ProductFormData) => {
          const newProduct: Product = {
            id: nextId(),
            name: data.name,
            category: data.category,
            price: data.price,
            stock: data.stock,
            status: data.status,
            image: data.image?.trim()
              ? data.image.trim()
              : "https://via.placeholder.com/52",
            productType: data.productType,
            supplementFlavor: data.supplementFlavor,
            supplementPresentation: data.supplementPresentation,
            supplementServings: data.supplementServings,
            apparelSize: data.apparelSize,
            apparelColor: data.apparelColor,
            apparelMaterial: data.apparelMaterial,
          };

          setProducts((prev) => [newProduct, ...prev]);
          setOpenModal(false);

          // Opcional: si estabas filtrando por categoría que no existe, la dejamos en "Todos"
          if (category !== "Todos" && category !== newProduct.category) {
            setCategory("Todos");
          }
        }}
      />
    </div>
  );
}
