import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FaArrowTrendUp,
  FaBoxesStacked,
  FaChartLine,
  FaEye,
  FaFilter,
  FaTableList,
  FaXmark,
  FaTriangleExclamation,
} from "react-icons/fa6";
import styles from "./AdminSalesPredictionPage.module.css";

type ForecastPeriod = "week" | "month" | "quarter";
type DetailForecastPeriod = "week" | "month";
type HistoryWindow = "4" | "8" | "12";
type DemandStatus = "Alta demanda" | "Demanda media" | "Baja demanda";

type SalesProduct = {
  id: string;
  name: string;
  category: string;
  brand: string;
  type: string;
  price: number;
  stock: number;
  cartAdds: number;
  promotion: boolean;
  history: number[];
};

type PredictionRow = SalesProduct & {
  weeklyPrediction: number;
  periodPrediction: number;
  status: DemandStatus;
  stockRisk: boolean;
  action: string;
  trendPercent: number;
};

const forecastOptions: Array<{
  value: ForecastPeriod;
  label: string;
  multiplier: number;
}> = [
  { value: "week", label: "Proxima semana", multiplier: 1 },
  { value: "month", label: "Proximo mes", multiplier: 4 },
  { value: "quarter", label: "Proximos 3 meses", multiplier: 12 },
];

const detailForecastOptions: Array<{
  value: DetailForecastPeriod;
  label: string;
  multiplier: number;
}> = [
  { value: "week", label: "Por semana", multiplier: 1 },
  { value: "month", label: "Por mes", multiplier: 4 },
];

const historyOptions: Array<{ value: HistoryWindow; label: string }> = [
  { value: "4", label: "Ultimas 4 semanas" },
  { value: "8", label: "Ultimas 8 semanas" },
  { value: "12", label: "Ultimas 12 semanas" },
];

const demoProducts: SalesProduct[] = [
  {
    id: "prd-001",
    name: "Proteina Whey Vainilla",
    category: "Suplementos",
    brand: "Optimum Nutrition",
    type: "Suplementacion",
    price: 899,
    stock: 16,
    cartAdds: 88,
    promotion: false,
    history: [7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 19, 21],
  },
  {
    id: "prd-002",
    name: "Creatina Monohidratada 300 g",
    category: "Suplementos",
    brand: "Titanium",
    type: "Suplementacion",
    price: 449,
    stock: 20,
    cartAdds: 73,
    promotion: true,
    history: [5, 6, 7, 7, 9, 9, 10, 11, 12, 13, 14, 15],
  },
  {
    id: "prd-003",
    name: "Pre-entreno C4 Ripped",
    category: "Suplementos",
    brand: "Cellucor",
    type: "Suplementacion",
    price: 649,
    stock: 8,
    cartAdds: 54,
    promotion: false,
    history: [4, 6, 5, 7, 7, 8, 9, 10, 12, 12, 13, 15],
  },
  {
    id: "prd-004",
    name: "Playera Training Dry Fit",
    category: "Ropa deportiva",
    brand: "Titanium",
    type: "Ropa",
    price: 988,
    stock: 10,
    cartAdds: 44,
    promotion: false,
    history: [6, 5, 7, 8, 8, 9, 9, 10, 10, 12, 12, 13],
  },
  {
    id: "prd-005",
    name: "Short Deportivo Performance",
    category: "Ropa deportiva",
    brand: "Titanium",
    type: "Ropa",
    price: 499,
    stock: 11,
    cartAdds: 39,
    promotion: true,
    history: [3, 4, 4, 5, 6, 7, 7, 8, 8, 9, 10, 10],
  },
  {
    id: "prd-006",
    name: "Shaker Titanium 700 ml",
    category: "Accesorios",
    brand: "Titanium",
    type: "Accesorio",
    price: 179,
    stock: 35,
    cartAdds: 62,
    promotion: false,
    history: [8, 9, 9, 10, 10, 11, 12, 12, 13, 15, 16, 17],
  },
  {
    id: "prd-007",
    name: "Guantes de Gimnasio",
    category: "Accesorios",
    brand: "Titanium",
    type: "Accesorio",
    price: 259,
    stock: 7,
    cartAdds: 26,
    promotion: false,
    history: [4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9],
  },
  {
    id: "prd-008",
    name: "Multivitaminico Fitness",
    category: "Suplementos",
    brand: "Universal",
    type: "Suplementacion",
    price: 289,
    stock: 28,
    cartAdds: 31,
    promotion: false,
    history: [6, 5, 6, 6, 7, 7, 6, 7, 8, 8, 9, 9],
  },
];

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

function linearRegressionPrediction(values: number[]) {
  const n = values.length;
  const sumX = values.reduce((sum, _value, index) => sum + index + 1, 0);
  const sumY = values.reduce((sum, value) => sum + value, 0);
  const sumXY = values.reduce(
    (sum, value, index) => sum + (index + 1) * value,
    0,
  );
  const sumX2 = values.reduce((sum, _value, index) => sum + (index + 1) ** 2, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
  const intercept = (sumY - slope * sumX) / n;

  return Math.max(0, Math.round(intercept + slope * (n + 1)));
}

function getDemandStatus(prediction: number): DemandStatus {
  if (prediction >= 16) return "Alta demanda";
  if (prediction >= 9) return "Demanda media";
  return "Baja demanda";
}

function getAction(row: SalesProduct, periodPrediction: number) {
  if (periodPrediction > row.stock) return "Reabastecer inventario";
  if (periodPrediction < row.stock * 0.35) return "Evaluar promocion";
  return "Mantener seguimiento";
}

function getTrendPercent(values: number[], prediction: number) {
  const previous = values.at(-1) ?? 1;
  return Math.round(((prediction - previous) / Math.max(previous, 1)) * 100);
}

export default function AdminSalesPredictionPage() {
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>("week");
  const [historyWindow, setHistoryWindow] = useState<HistoryWindow>("8");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [brandFilter, setBrandFilter] = useState("Todas");
  const [selectedProductId, setSelectedProductId] = useState(demoProducts[0].id);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [detailForecastPeriod, setDetailForecastPeriod] =
    useState<DetailForecastPeriod>("week");

  const selectedForecast = forecastOptions.find(
    (option) => option.value === forecastPeriod,
  )!;
  const selectedDetailForecast = detailForecastOptions.find(
    (option) => option.value === detailForecastPeriod,
  )!;
  const historyLength = Number(historyWindow);

  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(demoProducts.map((item) => item.category)))],
    [],
  );
  const brands = useMemo(
    () => ["Todas", ...Array.from(new Set(demoProducts.map((item) => item.brand)))],
    [],
  );

  const rows = useMemo<PredictionRow[]>(() => {
    return demoProducts.map((product) => {
      const history = product.history.slice(-historyLength);
      const weeklyPrediction = linearRegressionPrediction(history);
      const periodPrediction = weeklyPrediction * selectedForecast.multiplier;
      const status = getDemandStatus(weeklyPrediction);

      return {
        ...product,
        weeklyPrediction,
        periodPrediction,
        status,
        stockRisk: periodPrediction > product.stock,
        action: getAction(product, periodPrediction),
        trendPercent: getTrendPercent(history, weeklyPrediction),
      };
    });
  }, [historyLength, selectedForecast.multiplier]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesCategory =
        categoryFilter === "Todas" || row.category === categoryFilter;
      const matchesBrand = brandFilter === "Todas" || row.brand === brandFilter;

      return matchesCategory && matchesBrand;
    });
  }, [brandFilter, categoryFilter, rows]);

  const visibleRows = filteredRows.length ? filteredRows : rows;
  const selectedProduct =
    rows.find((product) => product.id === selectedProductId) ?? rows[0];
  const detailProduct = detailProductId
    ? rows.find((product) => product.id === detailProductId) ?? null
    : null;
  const detailPrediction = detailProduct
    ? detailProduct.weeklyPrediction * selectedDetailForecast.multiplier
    : 0;
  const detailStockRisk = detailProduct
    ? detailPrediction > detailProduct.stock
    : false;

  const buildTrendChartData = (
    product: PredictionRow,
    prediction = product.weeklyPrediction,
  ) => {
    const history = product.history.slice(-historyLength);
    const data: Array<{
      period: string;
      ventas: number | null;
      prediccion: number | null;
    }> = history.map((value, index) => ({
      period: `S${index + 1}`,
      ventas: value,
      prediccion: null,
    }));

    data.push({
      period: "Estimado",
      ventas: null,
      prediccion: prediction,
    });

    return data;
  };
  const trendChartData: Array<{
    period: string;
    ventas: number | null;
    prediccion: number | null;
  }> = buildTrendChartData(selectedProduct);

  const topDemandData = [...visibleRows]
    .sort((left, right) => right.periodPrediction - left.periodPrediction)
    .slice(0, 6)
    .map((row) => ({
      product: row.name.length > 18 ? `${row.name.slice(0, 18)}...` : row.name,
      prediccion: row.periodPrediction,
    }));

  const estimatedUnits = visibleRows.reduce(
    (sum, row) => sum + row.periodPrediction,
    0,
  );
  const estimatedRevenue = visibleRows.reduce(
    (sum, row) => sum + row.periodPrediction * row.price,
    0,
  );
  const highDemandCount = visibleRows.filter(
    (row) => row.status === "Alta demanda",
  ).length;
  const stockRiskCount = visibleRows.filter((row) => row.stockRisk).length;

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.heroBadge}>Regresion simulada</span>
          <h1>Prediccion de ventas</h1>
          <p>
            Estima la demanda futura por producto usando historial de ventas,
            stock, precio, categoria, marca y senales de carrito. Esta vista es
            una simulacion completa en frontend.
          </p>
        </div>
      </header>

      <section className={styles.filtersPanel} aria-label="Filtros de prediccion">
        <div className={styles.sectionTitle}>
          <span>
            <FaFilter />
          </span>
          <div>
            <h2>Filtros por periodo</h2>
            <p>Configura el rango historico y el periodo futuro a estimar.</p>
          </div>
        </div>

        <div className={styles.filtersGrid}>
          <label className={styles.field}>
            <span>Periodo a predecir</span>
            <select
              value={forecastPeriod}
              onChange={(event) =>
                setForecastPeriod(event.target.value as ForecastPeriod)
              }
            >
              {forecastOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Datos historicos</span>
            <select
              value={historyWindow}
              onChange={(event) =>
                setHistoryWindow(event.target.value as HistoryWindow)
              }
            >
              {historyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Categoria</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Marca</span>
            <select
              value={brandFilter}
              onChange={(event) => setBrandFilter(event.target.value)}
            >
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>

        </div>
      </section>

      <section className={styles.kpiGrid} aria-label="Resumen de prediccion">
        <article className={styles.kpiCard}>
          <span className={styles.kpiIcon}>
            <FaChartLine />
          </span>
          <div>
            <span>Ventas estimadas</span>
            <strong>{estimatedUnits} unidades</strong>
            <small>{selectedForecast.label}</small>
          </div>
        </article>

        <article className={styles.kpiCard}>
          <span className={styles.kpiIcon}>
            <FaArrowTrendUp />
          </span>
          <div>
            <span>Ingreso estimado</span>
            <strong>{currencyFormatter.format(estimatedRevenue)}</strong>
            <small>Segun precio actual</small>
          </div>
        </article>

        <article className={styles.kpiCard}>
          <span className={styles.kpiIcon}>
            <FaBoxesStacked />
          </span>
          <div>
            <span>Alta demanda</span>
            <strong>{highDemandCount} productos</strong>
            <small>Con tendencia positiva</small>
          </div>
        </article>

        <article className={styles.kpiCard}>
          <span className={styles.kpiIcon}>
            <FaTriangleExclamation />
          </span>
          <div>
            <span>Riesgo de stock</span>
            <strong>{stockRiskCount} productos</strong>
            <small>Prediccion supera inventario</small>
          </div>
        </article>
      </section>

      <section className={styles.chartGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.sectionTitle}>
              <span>
                <FaChartLine />
              </span>
              <div>
                <h2>Historial vs prediccion</h2>
                <p>Linea historica y valor estimado por regresion.</p>
              </div>
            </div>

            <label className={styles.compactField}>
              <span>Producto</span>
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
              >
                {rows.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  name="Ventas reales"
                  stroke="#111827"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="prediccion"
                  name="Prediccion"
                  stroke="#ef4444"
                  strokeWidth={3}
                  strokeDasharray="6 6"
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.sectionTitle}>
            <span>
              <FaArrowTrendUp />
            </span>
            <div>
              <h2>Productos con mayor demanda futura</h2>
              <p>Ranking segun el periodo seleccionado.</p>
            </div>
          </div>

          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDemandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="product" interval={0} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="prediccion" name="Unidades estimadas" radius={[8, 8, 0, 0]}>
                  {topDemandData.map((entry) => (
                    <Cell key={entry.product} fill="#ef4444" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionTitle}>
          <span>
            <FaTableList />
          </span>
          <div>
            <h2>Productos analizados</h2>
            <p>Selecciona un producto para revisar su prediccion individual.</p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <span className={styles.columnHeader}>
                    <FaTableList />
                    Producto
                  </span>
                </th>
                <th>
                  <span className={styles.columnHeader}>
                    <FaBoxesStacked />
                    Categoria
                  </span>
                </th>
                <th>
                  <span className={styles.columnHeader}>
                    <FaBoxesStacked />
                    Stock
                  </span>
                </th>
                <th>
                  <span className={styles.columnHeader}>
                    <FaChartLine />
                    Prediccion
                  </span>
                </th>
                <th>
                  <span className={styles.columnHeader}>
                    <FaArrowTrendUp />
                    Precio
                  </span>
                </th>
                <th>
                  <span className={styles.columnHeader}>
                    <FaEye />
                    Detalle
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    <span>{row.brand}</span>
                  </td>
                  <td>{row.category}</td>
                  <td>{row.stock} unidades</td>
                  <td>{row.periodPrediction} unidades</td>
                  <td>{currencyFormatter.format(row.price)}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.detailBtn}
                      onClick={() => setDetailProductId(row.id)}
                    >
                      <FaEye />
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {detailProduct && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={() => setDetailProductId(null)}
        >
          <section
            className={styles.detailModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="prediction-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.detailHeader}>
              <div>
                <span>{detailProduct.category}</span>
                <h2 id="prediction-detail-title">{detailProduct.name}</h2>
                <p>{detailProduct.brand}</p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setDetailProductId(null)}
                aria-label="Cerrar detalle"
              >
                <FaXmark />
              </button>
            </div>

            <div className={styles.detailStats}>
              <article>
                <span>Stock actual</span>
                <strong>{detailProduct.stock}</strong>
              </article>
              <article>
                <span>Prediccion</span>
                <strong>{detailPrediction}</strong>
              </article>
              <article>
                <span>Precio</span>
                <strong>{currencyFormatter.format(detailProduct.price)}</strong>
              </article>
              <article>
                <span>Agregado al carrito</span>
                <strong>{detailProduct.cartAdds}</strong>
              </article>
            </div>

            <div className={styles.detailChartBlock}>
              <div className={styles.detailChartTitle}>
                <strong>Stock actual vs prediccion</strong>
                <span>
                  Comparacion individual del producto seleccionado en{" "}
                  {selectedDetailForecast.label.toLowerCase()}.
                </span>
              </div>
              <div className={styles.detailMiniChart}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: detailProduct.name,
                        stock: detailProduct.stock,
                        prediccion: detailPrediction,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="stock"
                      name="Stock actual"
                      fill="#111827"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="prediccion"
                      name="Prediccion"
                      fill={detailStockRisk ? "#ef4444" : "#22c55e"}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.detailNote}>
              <div className={styles.detailNoteHeader}>
                <div>
                  <strong>Lectura del producto</strong>
                  <span>{selectedDetailForecast.label}</span>
                </div>

                <label className={styles.detailPeriodField}>
                  <span>Periodo</span>
                  <select
                    value={detailForecastPeriod}
                    onChange={(event) =>
                      setDetailForecastPeriod(
                        event.target.value as DetailForecastPeriod,
                      )
                    }
                  >
                    {detailForecastOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.readingCards}>
                <article>
                  <span>Stock actual</span>
                  <strong>{detailProduct.stock}</strong>
                  <small>unidades disponibles</small>
                </article>
                <article
                  className={
                    detailStockRisk
                      ? styles.readingCardRisk
                      : styles.readingCardOk
                  }
                >
                  <span>Prediccion</span>
                  <strong>{detailPrediction}</strong>
                  <small>unidades estimadas</small>
                </article>
              </div>

              <p>
                {detailStockRisk
                  ? "La prediccion supera el stock actual. Conviene revisar reabastecimiento."
                  : "El stock actual cubre la prediccion del periodo seleccionado."}
              </p>
            </div>

            <details className={styles.modelDetails}>
              <summary>Ver lectura del modelo</summary>
              <div className={styles.modelList}>
                <div>
                  <strong>Variables de entrada</strong>
                  <span>
                    Precio, stock, categoria, marca, tipo de producto, historial
                    semanal, carritos agregados y promociones.
                  </span>
                </div>
                <div>
                  <strong>Variable objetivo</strong>
                  <span>Unidades estimadas para el periodo seleccionado.</span>
                </div>
                <div>
                  <strong>Salida operativa</strong>
                  <span>
                    Estado de demanda, riesgo de stock y accion sugerida para
                    inventario.
                  </span>
                </div>
              </div>
            </details>
          </section>
        </div>
      )}
    </section>
  );
}
