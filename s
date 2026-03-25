[1mdiff --cc frontend/src/pages/visitor/CatalogePage.tsx[m
[1mindex e1c2d2e,a3a9b2f..0000000[m
[1m--- a/frontend/src/pages/visitor/CatalogePage.tsx[m
[1m+++ b/frontend/src/pages/visitor/CatalogePage.tsx[m
[36m@@@ -25,60 -28,9 +28,60 @@@[m [mconst cx = (...names: Array<string | nu[m
      .filter(Boolean)[m
      .join(" ");[m
  [m
[32m +type CatalogProductView = {[m
[32m +  id: string;[m
[32m +  name: string;[m
[32m +  category: string;[m
[32m +  description: string;[m
[32m +  price: number;[m
[32m +  originalPrice?: number;[m
[32m +  image: string;[m
[32m +  rating: number;[m
[32m +  reviewCount: number;[m
[32m +  featured: boolean;[m
[32m +  badge?: string;[m
[32m +  stock: number;[m
[32m +};[m
[32m +[m
[32m +const catalogSortOptions = [[m
[32m +  "RECOMENDADO",[m
[32m +  "PRECIO: MENOR A MAYOR",[m
[32m +  "PRECIO: MAYOR A MENOR",[m
[32m +  "MAS POPULARES",[m
[32m +  "MAS NUEVOS",[m
[32m +];[m
[32m +[m
[32m +const getCatalogProductPath = (id: string) => `/catalogo/${id}`;[m
[32m +[m
[32m +const mapCatalogProductToView = ([m
[32m +  product: CatalogProductDTO[m
[32m +): CatalogProductView => ({[m
[32m +  id: product.id,[m
[32m +  name: product.name,[m
[32m +  category: product.categoryName || product.productType || "General",[m
[32m +  description:[m
[32m +    product.description?.trim() || "Producto disponible en Titanium Shop.",[m
[32m +  price: Number(product.price ?? 0),[m
[32m +  originalPrice: undefined,[m
[32m +  image:[m
[32m +    product.imageUrl ||[m
[32m +    product.images?.[0]?.url ||[m
[32m +    "https://via.placeholder.com/600x600?text=Producto",[m
[32m +  rating: 5,[m
[32m +  reviewCount: 0,[m
[32m +  featured: Number(product.stock ?? 0) > 0,[m
[32m +  badge:[m
[32m +    product.productType === "Suplementación"[m
[32m +      ? "Suplemento"[m
[32m +      : product.productType === "Ropa"[m
[32m +        ? "Ropa"[m
[32m +        : undefined,[m
[32m +  stock: Number(product.stock ?? 0),[m
[32m +});[m
[32m +[m
  export default function CatalogoPage() {[m
    const { addItem, openCart } = useCart();[m
[31m- [m
[32m+   const [products, setProducts] = useState<CatalogProductView[]>([]);[m
    const [selectedCategory, setSelectedCategory] = useState("TODOS");[m
    const [sortBy, setSortBy] = useState("RECOMENDADO");[m
    const [searchQuery, setSearchQuery] = useState("");[m
[36m@@@ -86,40 -40,42 +91,74 @@@[m
    const [favorites, setFavorites] = useState<Set<CatalogProductView["id"]>>([m
      new Set()[m
    );[m
[32m +  const [products, setProducts] = useState<CatalogProductView[]>([]);[m
[32m +  const [loading, setLoading] = useState(true);[m
[32m +  const [error, setError] = useState("");[m
[32m +[m
    const productsPerPage = 8;[m
[32m+   const catalogCategories = useMemo([m
[32m+     () => buildCatalogCategories(products),[m
[32m+     [products][m
[32m+   );[m
[32m+ [m
[32m+   useEffect(() => {[m
[32m+     let ignore = false;[m
[32m+ [m
[32m+     const loadProducts = async () => {[m
[32m+       setIsLoading(true);[m
[32m+       setLoadError(null);[m
[32m+ [m
[32m+       try {[m
[32m+         const nextProducts = await fetchCatalogProducts();[m
[32m+         if (ignore) return;[m
[32m+         setProducts(nextProducts);[m
[32m+       } catch (error) {[m
[32m+         if (ignore) return;[m
[32m+         console.error("fetchCatalogProducts error:", error);[m
[32m+         setProducts([]);[m
[32m+         setLoadError("No pudimos cargar el catalogo desde el backend.");[m
[32m+       } finally {[m
[32m+         if (!ignore) {[m
[32m+           setIsLoading(false);[m
[32m+         }[m
[32m+       }[m
[32m+     };[m
[32m+ [m
[32m+     void loadProducts();[m
[32m+ [m
[32m+     return () => {[m
[32m+       ignore = true;[m
[32m+     };[m
[32m+   }, []);[m
  [m
[32m +  useEffect(() => {[m
[32m +    const loadProducts = async () => {[m
[32m +      try {[m
[32m +        setLoading(true);[m
[32m +        setError("");[m
[32m +[m
[32m +        const data = await getCatalogProducts();[m
[32m +        const mappedProducts = data.map(mapCatalogProductToView);[m
[32m +[m
[32m +        setProducts(mappedProducts);[m
[32m +      } catch (err) {[m
[32m +        console.error("Error cargando catálogo:", err);[m
[32m +        setError("No se pudieron cargar los productos.");[m
[32m +      } finally {[m
[32m +        setLoading(false);[m
[32m +      }[m
[32m +    };[m
[32m +[m
[32m +    loadProducts();[m
[32m +  }, []);[m
[32m +[m
[32m +  const catalogCategories = useMemo(() => {[m
[32m +    const dynamicCategories = Array.from([m
[32m +      new Set(products.map((product) => product.category).filter(Boolean))[m
[32m +    );[m
[32m +    return ["TODOS", ...dynamicCategories];[m
[32m +  }, [products]);[m
[32m +[m
    const filteredProducts = useMemo(() => {[m
      let filtered = [...products];[m
  [m
[1mdiff --git a/frontend/src/pages/visitor/CatalogProductPage.tsx b/frontend/src/pages/visitor/CatalogProductPage.tsx[m
[1mindex 3d60bbe..1e59245 100644[m
[1m--- a/frontend/src/pages/visitor/CatalogProductPage.tsx[m
[1m+++ b/frontend/src/pages/visitor/CatalogProductPage.tsx[m
[36m@@ -1,3 +1,4 @@[m
[32m+[m[32m/* eslint-disable @typescript-eslint/no-explicit-any */[m
 import { useEffect, useState } from "react";[m
 import { Link, useParams } from "react-router-dom";[m
 import { FaChevronRight, FaHome } from "react-icons/fa";[m
