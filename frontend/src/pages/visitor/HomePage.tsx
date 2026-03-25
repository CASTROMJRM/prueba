import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FaArrowRight,
  FaAward,
  FaCalendarAlt,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaDumbbell,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRegEye,
  FaShoppingCart,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import styles from "./HomePage.module.css";
import { useCart } from "../../context/CartContext";
import {
  fetchCatalogProducts,
  getCatalogProductPath,
  type CatalogProductView,
} from "./catalogData";

import HeroExterior from "../../assets/SliderTitanuim.jpg";
import HeroTeam from "../../assets/abaout1.jpg";
import HeroCoaching from "../../assets/vision.jpg";
import TrainerCarlos from "../../assets/1.jpg";
import TrainerMaria from "../../assets/2.jpg";
import TrainerAlex from "../../assets/3.jpg";

const cx = (...names: Array<string | null | undefined | false>) =>
  names
    .flatMap((name) => (name ? name.split(" ") : []))
    .map((name) => styles[name])
    .filter(Boolean)
    .join(" ");

type HeroSlide = {
  label: string;
  title: string;
  accent: string;
  description: string;
  image: string;
};

type StatItem = {
  icon: IconType;
  value: string;
  label: string;
  description: string;
};

type PlanItem = {
  name: string;
  price: number;
  level: string;
  features: string[];
  popular?: boolean;
};

type TrainerItem = {
  name: string;
  role: string;
  description: string;
  image: string;
};

type DayKey = "Lun" | "Mar" | "Mie" | "Jue" | "Vie" | "Sab" | "Dom";

type ScheduleStatus = "weekday" | "saturday" | "sunday";

type ScheduleDay = {
  shortLabel: DayKey;
  label: string;
  schedule: string;
  description: string;
  status: ScheduleStatus;
  hoursOpen: string;
};

const heroSlides: HeroSlide[] = [
  {
    label: "Bienvenido a:",
    title: "Titanium Sport Gym",
    accent: "Tu destino de transformacion",
    description:
      "Descubre un espacio disenado para potenciar tu rendimiento, con entrenadores presentes y una comunidad que empuja tu progreso cada dia.",
    image: HeroExterior,
  },
  {
    label: "Entrena con:",
    title: "Coaching Titanium",
    accent: "Tecnica, energia y acompanamiento",
    description:
      "Cada sesion busca que avances con mas estructura, mejor ejecucion y una experiencia visual mucho mas fuerte en todo el home.",
    image: HeroCoaching,
  },
  {
    label: "Vive una:",
    title: "Comunidad real",
    accent: "Disciplina, identidad y constancia",
    description:
      "Titanium no se siente generico. Tiene ambiente propio, bloques claros y una narrativa visual mas cercana a la referencia que me mostraste.",
    image: HeroTeam,
  },
];

const stats: StatItem[] = [
  {
    icon: FaUsers,
    value: "5,000+",
    label: "Miembros Activos",
    description: "Comunidad creciendo cada dia",
  },
  {
    icon: FaDumbbell,
    value: "200+",
    label: "Equipos",
    description: "Ultima generacion",
  },
  {
    icon: FaCalendarAlt,
    value: "50+",
    label: "Clases Semanales",
    description: "Para todos los niveles",
  },
  {
    icon: FaAward,
    value: "15+",
    label: "Entrenadores",
    description: "Certificados y presentes en piso",
  },
];

const plans: PlanItem[] = [
  {
    name: "Carte Blanche",
    price: 299,
    level: "Basico",
    features: [
      "Acceso al gimnasio",
      "Horario limitado (6am - 2pm)",
      "Zona de cardio",
      "Vestidores",
    ],
  },
  {
    name: "Titanium Rojo",
    price: 499,
    level: "Premium",
    popular: true,
    features: [
      "Acceso ilimitado 24/7",
      "Todas las areas",
      "Clases grupales incluidas",
      "Casillero personal",
      "Evaluacion mensual",
    ],
  },
  {
    name: "Titanium Negro",
    price: 799,
    level: "Elite",
    features: [
      "Todo lo de Premium",
      "Entrenador personal (4 sesiones)",
      "Plan nutricional",
      "Acceso a spa",
      "Invitados (2/mes)",
      "Estacionamiento VIP",
    ],
  },
];

const trainers: TrainerItem[] = [
  {
    name: "Carlos Mendoza",
    role: "Fuerza y coaching principal",
    description:
      "Sesiones enfocadas en tecnica, progresion y una ejecucion mucho mas limpia dentro del piso.",
    image: TrainerCarlos,
  },
  {
    name: "Maria Gonzalez",
    role: "Nutricion y acompanamiento",
    description:
      "Seguimiento cercano para sostener habitos, alimentacion y constancia a largo plazo.",
    image: TrainerMaria,
  },
  {
    name: "Alex Rodriguez",
    role: "Entrenamiento funcional",
    description:
      "Clases intensas, movilidad y trabajo dinamico para quienes buscan subir nivel con estructura.",
    image: TrainerAlex,
  },
];

const weeklySchedule: ScheduleDay[] = [
  {
    shortLabel: "Lun",
    label: "Lunes",
    schedule: "5:30 AM - 11:00 PM",
    description: "Acceso general a pesas, cardio y zona funcional.",
    status: "weekday",
    hoursOpen: "17.5 horas abiertas",
  },
  {
    shortLabel: "Mar",
    label: "Martes",
    schedule: "5:30 AM - 11:00 PM",
    description: "Acceso general a pesas, cardio y zona funcional.",
    status: "weekday",
    hoursOpen: "17.5 horas abiertas",
  },
  {
    shortLabel: "Mie",
    label: "Miercoles",
    schedule: "5:30 AM - 11:00 PM",
    description: "Acceso general a pesas, cardio y zona funcional.",
    status: "weekday",
    hoursOpen: "17.5 horas abiertas",
  },
  {
    shortLabel: "Jue",
    label: "Jueves",
    schedule: "5:30 AM - 11:00 PM",
    description: "Acceso general a pesas, cardio y zona funcional.",
    status: "weekday",
    hoursOpen: "17.5 horas abiertas",
  },
  {
    shortLabel: "Vie",
    label: "Viernes",
    schedule: "5:30 AM - 11:00 PM",
    description: "Acceso general a pesas, cardio y zona funcional.",
    status: "weekday",
    hoursOpen: "17.5 horas abiertas",
  },
  {
    shortLabel: "Sab",
    label: "Sabado",
    schedule: "8:00 AM - 6:00 PM",
    description: "Operacion de fin de semana con zonas principales.",
    status: "saturday",
    hoursOpen: "10 horas abiertas",
  },
  {
    shortLabel: "Dom",
    label: "Domingo",
    schedule: "8:00 AM - 4:00 PM",
    description: "Horario dominical con operacion reducida.",
    status: "sunday",
    hoursOpen: "8 horas abiertas",
  },
];

function getScheduleStatusLabel(status: ScheduleStatus) {
  if (status === "weekday") return "Horario amplio";
  if (status === "saturday") return "Jornada sabatina";
  return "Horario dominical";
}

const HOME_STORE_PRODUCTS_LIMIT = 6;

export default function HomePage() {
  const { addItem, openCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [storeProducts, setStoreProducts] = useState<CatalogProductView[]>([]);
  const [isStoreLoading, setIsStoreLoading] = useState(true);
  const productTrackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadStoreProducts = async () => {
      setIsStoreLoading(true);

      try {
        const nextProducts = await fetchCatalogProducts();
        if (ignore) return;
        setStoreProducts(nextProducts);
      } catch (error) {
        if (ignore) return;
        console.error("fetchCatalogProducts error:", error);
        setStoreProducts([]);
      } finally {
        if (!ignore) {
          setIsStoreLoading(false);
        }
      }
    };

    void loadStoreProducts();

    return () => {
      ignore = true;
    };
  }, []);

  const activeSlide = heroSlides[currentSlide];
  const homeStoreProducts = useMemo(() => {
    const recommendedProducts = [...storeProducts].sort((left, right) => {
      if (Number(right.inStock) !== Number(left.inStock)) {
        return Number(right.inStock) - Number(left.inStock);
      }

      if (Number(right.featured) !== Number(left.featured)) {
        return Number(right.featured) - Number(left.featured);
      }

      return (
        new Date(right.createdAt ?? 0).getTime() -
        new Date(left.createdAt ?? 0).getTime()
      );
    });

    return recommendedProducts.slice(0, HOME_STORE_PRODUCTS_LIMIT);
  }, [storeProducts]);

  const scrollProducts = (direction: number) => {
    productTrackRef.current?.scrollBy({
      left: 340 * direction,
      behavior: "smooth",
    });
  };

  const addProductToCart = (product: CatalogProductView) => {
    if (!product.inStock) return;
    addItem(product);
    openCart();
  };

  return (
    <main className={cx("home-page")}>
      <section className={cx("home-hero")}>
        <div className={cx("home-hero__media")} aria-hidden="true">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.title}
              className={cx("home-hero__slide", index === currentSlide && "is-active")}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}
        </div>

        <div className={cx("home-hero__overlay")} />

        <div className={cx("home-shell home-hero__inner")}>
          <span className={cx("home-hero__label")}>{activeSlide.label}</span>
          <h1 className={cx("home-hero__title")}>{activeSlide.title}</h1>
          <p className={cx("home-hero__accent")}>{activeSlide.accent}</p>
          <p className={cx("home-hero__description")}>{activeSlide.description}</p>

          <div className={cx("home-hero__actions")}>
            <Link to="/register" className={cx("home-button home-button--solid")}>
              SUSCRIBETE
            </Link>
            <Link to="/AboutePage" className={cx("home-button home-button--outline")}>
              CONOCE MAS
            </Link>
          </div>

          <div className={cx("home-hero__dots")}>
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={cx("home-hero__dot", index === currentSlide && "is-active")}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={cx("home-stats")}>
        <div className={cx("home-shell home-stats__grid")}>
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.label} className={cx("home-stats__item")}>
                <span className={cx("home-stats__icon")}>
                  <Icon />
                </span>
                <strong className={cx("home-stats__value")}>{item.value}</strong>
                <h2 className={cx("home-stats__label")}>{item.label}</h2>
                <p className={cx("home-stats__description")}>{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className={cx("home-store")}>
        <div className={cx("home-shell")}>
          <div className={cx("home-section-head home-section-head--row")}>
            <div>
              <h2 className={cx("home-section-title home-section-title--left")}>
                TIENDA <span>ONLINE</span>
              </h2>
              <span className={cx("home-section-line")} />
            </div>

            <div className={cx("home-section-controls")}>
              <button
                type="button"
                className={cx("home-control-button")}
                onClick={() => scrollProducts(-1)}
                aria-label="Productos anteriores"
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                className={cx("home-control-button")}
                onClick={() => scrollProducts(1)}
                aria-label="Productos siguientes"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          <div ref={productTrackRef} className={cx("home-store__track")}>
            {homeStoreProducts.map((product) => (
              <article key={product.id} className={cx("home-product-card")}>
                <div className={cx("home-product-card__image-wrap")}>
                  {product.badge && (
                    <span className={cx("home-product-card__badge")}>
                      {product.badge}
                    </span>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className={cx("home-product-card__image")}
                  />
                </div>

                <div className={cx("home-product-card__body")}>
                  <h3 className={cx("home-product-card__name")}>{product.name}</h3>
                  <div className={cx("home-product-card__rating")}>
                    <div className={cx("home-product-card__stars")} aria-hidden="true">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <FaStar
                          key={`${product.id}-${index}`}
                          className={cx(
                            index < product.rating ? "is-filled" : "is-empty"
                          )}
                        />
                      ))}
                    </div>
                    <span>({product.reviewCount})</span>
                  </div>
                  <div className={cx("home-product-card__price-row")}>
                    {typeof product.originalPrice === "number" &&
                      product.originalPrice > product.price && (
                      <span className={cx("home-product-card__old-price")}>
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className={cx("home-product-card__price")}>
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <div className={cx("home-product-card__actions")}>
                    <button
                      type="button"
                      className={cx(
                        "home-product-card__action",
                        "home-product-card__action--primary"
                      )}
                      onClick={() => addProductToCart(product)}
                      disabled={!product.inStock}
                    >
                      <FaShoppingCart />
                      {product.inStock ? "Agregar al carrito" : "Sin stock"}
                    </button>
                    <Link
                      to={getCatalogProductPath(product.id)}
                      className={cx(
                        "home-product-card__action",
                        "home-product-card__action--secondary"
                      )}
                    >
                      <FaRegEye />
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {!isStoreLoading && homeStoreProducts.length === 0 && (
            <p className={cx("home-section-text")}>
              No pudimos mostrar productos en este momento. Puedes ver todo el
              catalogo en la tienda completa.
            </p>
          )}
        </div>
      </section>

      <section className={cx("home-plans")}>
        <div className={cx("home-shell")}>
          <div className={cx("home-section-head home-section-head--center")}>
            <h2 className={cx("home-section-title")}>
              NUESTROS <span>PLANES</span>
            </h2>
            <p className={cx("home-section-text")}>
              Elige el plan que mejor se adapte a tus objetivos y estilo de vida
            </p>
          </div>

          <div className={cx("home-plans__grid")}>
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={cx("home-plan-card", plan.popular && "is-popular")}
              >
                {plan.popular && (
                  <span className={cx("home-plan-card__popular")}>Popular</span>
                )}
                <h3 className={cx("home-plan-card__title")}>{plan.level}</h3>
                <div className={cx("home-plan-card__price")}>
                  <strong>${plan.price}</strong>
                  <span>MXN/mes</span>
                </div>
                <ul className={cx("home-plan-card__features")}>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <FaCheck />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/suscripciones"
                  className={cx("home-plan-card__button", plan.popular && "is-popular")}
                >
                  Elegir Plan
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={cx("home-trainers")}>
        <div className={cx("home-shell")}>
          <div className={cx("home-section-head home-section-head--center")}>
            <h2 className={cx("home-section-title")}>
              NUESTROS <span>ENTRENADORES</span>
            </h2>
            <p className={cx("home-section-text")}>
              Un equipo visible, cercano y alineado al tipo de experiencia que
              quieres transmitir en todo el home.
            </p>
          </div>

          <div className={cx("home-trainers__grid")}>
            {trainers.map((trainer) => (
              <article key={trainer.name} className={cx("home-trainer-card")}>
                <div className={cx("home-trainer-card__media")}>
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className={cx("home-trainer-card__image")}
                  />
                </div>
                <div className={cx("home-trainer-card__body")}>
                  <span className={cx("home-trainer-card__role")}>{trainer.role}</span>
                  <h3 className={cx("home-trainer-card__name")}>{trainer.name}</h3>
                  <p className={cx("home-trainer-card__description")}>
                    {trainer.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={cx("home-schedule")}>
        <div className={cx("home-shell home-schedule__inner")}>
          <div className={cx("home-section-head home-section-head--center home-section-head--light")}>
            <h2 className={cx("home-section-title home-section-title--light")}>
              HORARIOS DEL <span>GIMNASIO</span>
            </h2>
            <p className={cx("home-section-text home-section-text--light")}>
              Consulta los horarios reales de apertura para organizar tu semana
              y entrenar en Titanium con informacion actualizada.
            </p>
          </div>

          <div className={cx("home-schedule__table-wrap")}>
            <table className={cx("home-schedule__table")}>
              <thead>
                <tr>
                  {weeklySchedule.map((day) => (
                    <th key={day.shortLabel}>{day.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {weeklySchedule.map((day) => (
                    <td key={day.shortLabel}>
                      <article
                        className={cx(
                          "home-schedule__day-card",
                          `home-schedule__day-card--${day.status}`
                        )}
                      >
                        <span className={cx("home-schedule__day-kicker")}>
                          <FaClock />
                          {getScheduleStatusLabel(day.status)}
                        </span>
                        <strong className={cx("home-schedule__day-hours")}>
                          {day.schedule}
                        </strong>
                        <p className={cx("home-schedule__day-description")}>{day.description}</p>
                        <span
                          className={cx(
                            "home-schedule__day-badge",
                            `home-schedule__day-badge--${day.status}`
                          )}
                        >
                          {day.hoursOpen}
                        </span>
                      </article>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={cx("home-cta")}>
        <div className={cx("home-shell")}>
          <div className={cx("home-cta__inner")}>
            <div className={cx("home-cta__media")}>
              <img
                src={HeroCoaching}
                alt="Entrenamiento en Titanium Sport Gym"
                className={cx("home-cta__image")}
              />
              <div className={cx("home-cta__media-overlay")} />
            </div>

            <div className={cx("home-cta__panel")}>
              <div className={cx("home-cta__content")}>
                <span className={cx("home-cta__eyebrow")}>Titanium Sport Gym</span>
                <h2 className={cx("home-cta__title")}>
                  Listo para comenzar tu transformacion?
                </h2>
                <p className={cx("home-cta__description")}>
                  Unete a la comunidad Titanium y empieza a ver resultados desde el
                  primer dia. Nuestros entrenadores te guiaran en cada paso del
                  camino.
                </p>

                <div className={cx("home-cta__actions")}>
                  <Link
                    to="/register"
                    className={cx("home-button home-button--light")}
                  >
                    Comenzar Ahora
                    <FaArrowRight />
                  </Link>
                  <a
                    href="mailto:tsghuejutla@gmail.com"
                    className={cx("home-button home-button--ghost-light")}
                  >
                    Contactanos
                  </a>
                </div>
              </div>

              <div className={cx("home-cta__cards")}>
                <a href="tel:7711976803" className={cx("home-cta__card")}>
                  <span className={cx("home-cta__card-icon")}>
                    <FaPhoneAlt />
                  </span>
                  <span className={cx("home-cta__card-copy")}>
                    <span className={cx("home-cta__card-label")}>Llamanos</span>
                    <strong className={cx("home-cta__card-value")}>
                      771 197 6803
                    </strong>
                  </span>
                </a>

                <a
                  href="mailto:tsghuejutla@gmail.com"
                  className={cx("home-cta__card")}
                >
                  <span className={cx("home-cta__card-icon")}>
                    <FaEnvelope />
                  </span>
                  <span className={cx("home-cta__card-copy")}>
                    <span className={cx("home-cta__card-label")}>Escribenos</span>
                    <strong className={cx("home-cta__card-value")}>
                      tsghuejutla@gmail.com
                    </strong>
                  </span>
                </a>

                <div className={cx("home-cta__card")}>
                  <span className={cx("home-cta__card-icon")}>
                    <FaMapMarkerAlt />
                  </span>
                  <span className={cx("home-cta__card-copy")}>
                    <span className={cx("home-cta__card-label")}>Visitanos</span>
                    <strong className={cx("home-cta__card-value")}>
                      Av. Corona del Rosal N 15, Huejutla, Hidalgo
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
