import { startTransition, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FaBolt,
  FaCalendarAlt,
  FaCheck,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaCrown,
  FaDumbbell,
  FaExclamationTriangle,
  FaFireAlt,
  FaQuoteRight,
  FaShieldAlt,
  FaStar,
  FaSyncAlt,
  FaTicketAlt,
  FaUserGraduate,
  FaUsers,
} from "react-icons/fa";
import {
  getMembershipPlans,
  type MembershipPlan,
} from "../../services/membershipService";
import styles from "./SuscripcionesPage.module.css";

type PlanTheme = "light" | "dark";
type PlansStatus = "loading" | "ready" | "error";

type HeroBenefit = {
  label: string;
  icon: IconType;
};

type Testimonial = {
  id: string;
  name: string;
  plan: string;
  tenure: string;
  quote: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type PlanSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  plans: MembershipPlan[];
};

const heroBenefits: HeroBenefit[] = [
  { label: "Planes por dias", icon: FaCalendarAlt },
  { label: "Paquetes separados", icon: FaUsers },
  { label: "Sin permanencia", icon: FaBolt },
];

const testimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    name: "Ana Martinez",
    plan: "Premium",
    tenure: "10 meses con nosotros",
    quote:
      "Las clases grupales son lo mejor. Me encanta el ambiente y la energia que se siente. El equipo siempre esta atento a ayudarte en lo que necesites.",
  },
  {
    id: "testimonial-2",
    name: "Luis Herrera",
    plan: "Elite",
    tenure: "1 ano entrenando en Titanium",
    quote:
      "Lo que mas valoro es la estructura. Tengo acceso, seguimiento y sesiones que realmente me mantienen avanzando sin perder el ritmo.",
  },
  {
    id: "testimonial-3",
    name: "Sofia Vega",
    plan: "Basico",
    tenure: "5 meses en la comunidad",
    quote:
      "Entre por el plan mas accesible y me quede por la calidad del lugar. Nunca se siente improvisado y eso motiva mucho a volver.",
  },
];

const faqs: FaqItem[] = [
  {
    question: "Puedo cancelar mi membresia en cualquier momento?",
    answer:
      "Si. Todas nuestras membresias son sin permanencia. Puedes cancelar cuando quieras sin penalizaciones, solo te pedimos avisar antes de tu siguiente ciclo.",
  },
  {
    question: "Como funciona la garantia de 30 dias?",
    answer:
      "Si durante los primeros 30 dias sientes que el plan no era para ti, revisamos tu caso con el equipo y te ayudamos a cambiar de plan o resolver tu proceso.",
  },
  {
    question: "Puedo cambiar de plan en cualquier momento?",
    answer:
      "Si. Puedes subir o bajar de nivel segun tu momento. El ajuste se hace sobre tu siguiente corte para mantener el control de tu suscripcion.",
  },
  {
    question: "Que incluyen las sesiones con entrenador personal?",
    answer:
      "Incluyen evaluacion inicial, ajuste de rutina, correccion tecnica y seguimiento segun el plan que elijas. En Elite el acompanamiento es mas frecuente.",
  },
];

const mxnPriceFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

function toFiniteNumber(value: string | number | null | undefined, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function formatPriceMXN(value: string | number | null | undefined) {
  return mxnPriceFormatter.format(toFiniteNumber(value));
}

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "TS";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function getPlanDurationDays(plan: MembershipPlan) {
  const days = Math.round(toFiniteNumber(plan.durationDays, 1));
  return Math.max(days, 1);
}

function formatDurationLabel(days: number) {
  return days === 1 ? "1 dia" : `${days} dias`;
}

function getPlanTypeLabel(plan: MembershipPlan) {
  switch (plan.type) {
    case "group":
      return "Paquete";
    case "student":
      return "Estudiante";
    case "visit":
      return "Pase";
    default:
      return "Individual";
  }
}

function getPeopleLabel(plan: MembershipPlan) {
  const minPeople = Math.max(Math.round(toFiniteNumber(plan.minPeople, 1)), 1);
  const maxPeople = Math.max(Math.round(toFiniteNumber(plan.maxPeople, 1)), 1);

  if (plan.type !== "group") {
    return "1 persona";
  }

  if (minPeople === maxPeople) {
    return `${maxPeople} personas`;
  }

  return `${minPeople}-${maxPeople} personas`;
}

function getPlanIcon(plan: MembershipPlan): IconType {
  if (plan.type === "group") return FaUsers;
  if (plan.type === "student") return FaUserGraduate;
  if (plan.type === "visit") return FaTicketAlt;
  if (plan.accessLevel === "premium" || getPlanDurationDays(plan) >= 180) {
    return FaCrown;
  }
  if (plan.accessLevel === "standard") return FaDumbbell;
  return FaFireAlt;
}

function isFeaturedPlan(plan: MembershipPlan) {
  const slug = plan.slug.toLowerCase();

  if (plan.type === "group") {
    return getPeopleLabel(plan) === "2 personas";
  }

  return (
    slug.includes("regular-mensual") ||
    (plan.type === "individual" && getPlanDurationDays(plan) === 30)
  );
}

function getPlanTheme(plan: MembershipPlan): PlanTheme {
  return isFeaturedPlan(plan) ? "dark" : "light";
}

function getPlanPriceSuffix(plan: MembershipPlan) {
  const duration = formatDurationLabel(getPlanDurationDays(plan));

  if (plan.type === "group") {
    return `MXN paquete / ${duration}`;
  }

  if (plan.type === "visit") {
    return "MXN / visita";
  }

  return `MXN / ${duration}`;
}

function getPlanPriceMeta(plan: MembershipPlan) {
  const duration = formatDurationLabel(getPlanDurationDays(plan));

  if (plan.type === "group") {
    return `${formatPriceMXN(plan.pricePerPerson)} por persona. Vigencia de ${duration}.`;
  }

  if (plan.type === "student") {
    return `Tarifa especial con credencial vigente. Vigencia de ${duration}.`;
  }

  if (plan.type === "visit") {
    return "Acceso de un solo dia, ideal para probar el gimnasio.";
  }

  return `Vigencia clara de ${duration}, sin mezclarlo con paquetes.`;
}

function getPlanBenefits(plan: MembershipPlan) {
  const benefits = Array.isArray(plan.benefits)
    ? plan.benefits.map((benefit) => String(benefit).trim()).filter(Boolean)
    : [];

  if (benefits.length > 0) {
    return benefits;
  }

  const duration = formatDurationLabel(getPlanDurationDays(plan));

  if (plan.type === "group") {
    return [
      `Acceso para ${getPeopleLabel(plan)}`,
      `Vigencia de ${duration}`,
      "Cada integrante conserva su membresia",
    ];
  }

  return [
    `Acceso al gimnasio por ${duration}`,
    "Activacion registrada por administracion",
    "Consulta de pagos desde el portal",
  ];
}

function sortPlansByOrder(plans: MembershipPlan[]) {
  return [...plans].sort((firstPlan, secondPlan) => {
    const orderDifference =
      toFiniteNumber(firstPlan.sortOrder) - toFiniteNumber(secondPlan.sortOrder);

    if (orderDifference !== 0) {
      return orderDifference;
    }

    return getPlanDurationDays(firstPlan) - getPlanDurationDays(secondPlan);
  });
}

export default function SuscripcionesPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [plansStatus, setPlansStatus] = useState<PlansStatus>("loading");
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

  async function loadPlans() {
    setPlansStatus("loading");

    try {
      const response = await getMembershipPlans();
      const loadedPlans = Array.isArray(response?.plans) ? response.plans : [];

      setPlans(sortPlansByOrder(loadedPlans));
      setPlansStatus("ready");
    } catch (error) {
      console.error("PUBLIC MEMBERSHIP PLANS ERROR:", error);
      setPlans([]);
      setPlansStatus("error");
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    void loadPlans();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      startTransition(() => {
        setActiveTestimonialIndex(
          (currentIndex) => (currentIndex + 1) % testimonials.length,
        );
      });
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, []);

  const planSections = useMemo<PlanSection[]>(() => {
    const activePlans = plans.filter((plan) => plan.isActive);
    const shortStayPlans = activePlans.filter(
      (plan) => plan.type !== "group" && getPlanDurationDays(plan) < 30,
    );
    const membershipPlans = activePlans.filter(
      (plan) => plan.type !== "group" && getPlanDurationDays(plan) >= 30,
    );
    const packagePlans = activePlans.filter((plan) => plan.type === "group");

    return [
      {
        id: "pases",
        eyebrow: "Pases por dias",
        title: "Visitas, semana y quincena",
        description:
          "Opciones cortas para entrenar por dia o por periodos pequenos, sin mezclarlas con paquetes.",
        plans: shortStayPlans,
      },
      {
        id: "membresias",
        eyebrow: "Membresias",
        title: "Planes individuales",
        description:
          "Planes por duracion definida: mensual, estudiante, semestre y anualidad.",
        plans: membershipPlans,
      },
      {
        id: "paquetes",
        eyebrow: "Paquetes grupales",
        title: "Paquetes separados",
        description:
          "Planes para grupos con precio total y costo por persona visible desde la tarjeta.",
        plans: packagePlans,
      },
    ].filter((section) => section.plans.length > 0);
  }, [plans]);

  const activeTestimonial = testimonials[activeTestimonialIndex];

  const goToPreviousTestimonial = () => {
    startTransition(() => {
      setActiveTestimonialIndex((currentIndex) =>
        currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1,
      );
    });
  };

  const goToNextTestimonial = () => {
    startTransition(() => {
      setActiveTestimonialIndex(
        (currentIndex) => (currentIndex + 1) % testimonials.length,
      );
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.pageTexture} aria-hidden="true" />
      <div className={styles.pageGlowTop} aria-hidden="true" />
      <div className={styles.pageGlowSide} aria-hidden="true" />

      <section className={styles.heroSection}>
        <div className={styles.shell}>
          <div className={styles.heroInner}>
            <span className={styles.heroBadge}>Planes exclusivos</span>

            <h1 className={styles.heroTitle}>
              Elige tu <span className={styles.titleAccent}>Membresia</span>
            </h1>

            <p className={styles.heroDescription}>
              Consulta las opciones reales del sistema: pases por dias,
              membresias individuales y paquetes grupales separados. Cada plan
              muestra su duracion, precio y beneficios de forma clara.
            </p>

            <div className={styles.heroBenefits}>
              {heroBenefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.label}
                    className={styles.benefitChip}
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <span className={styles.benefitIcon}>
                      <Icon />
                    </span>
                    <span>{benefit.label}</span>
                  </div>
                );
              })}
            </div>

            <div className={styles.scrollCue}>
              <span>Desliza para ver planes</span>
              <a href="#planes" className={styles.scrollMouse} aria-label="Ir a los planes">
                <span className={styles.scrollWheel} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="planes" className={styles.plansSection}>
        <div className={styles.shell}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Membresias Titanium</span>
            <h2 className={styles.sectionTitle}>
              Nuestros <span className={styles.sectionAccent}>Planes</span>
            </h2>
            <p className={styles.sectionDescription}>
              Elige por duracion, tipo de acceso o paquete grupal. La vista
              publica toma estos datos desde el catalogo de membresias.
            </p>
          </div>

          {plansStatus === "loading" ? (
            <div className={styles.planState}>
              <span className={styles.planStateIcon}>
                <FaSyncAlt />
              </span>
              <strong>Cargando planes disponibles...</strong>
              <p>Estamos consultando las membresias activas del sistema.</p>
            </div>
          ) : null}

          {plansStatus === "error" ? (
            <div className={styles.planState}>
              <span className={styles.planStateIcon}>
                <FaExclamationTriangle />
              </span>
              <strong>No se pudieron cargar los planes</strong>
              <p>
                Revisa que el backend este activo para mostrar la informacion
                publica de membresias.
              </p>
              <button
                type="button"
                className={styles.planStateButton}
                onClick={() => void loadPlans()}
              >
                <FaSyncAlt />
                Reintentar
              </button>
            </div>
          ) : null}

          {plansStatus === "ready" && planSections.length === 0 ? (
            <div className={styles.planState}>
              <span className={styles.planStateIcon}>
                <FaShieldAlt />
              </span>
              <strong>No hay planes activos por ahora</strong>
              <p>Cuando se activen membresias, apareceran en esta seccion.</p>
            </div>
          ) : null}

          {plansStatus === "ready" && planSections.length > 0 ? (
            <div className={styles.plansContent}>
              {planSections.map((section) => (
                <section key={section.id} className={styles.planGroup}>
                  <div className={styles.planGroupHeader}>
                    <span className={styles.planGroupKicker}>{section.eyebrow}</span>
                    <h3 className={styles.planGroupTitle}>{section.title}</h3>
                    <p className={styles.planGroupDescription}>
                      {section.description}
                    </p>
                  </div>

                  <div className={styles.plansGrid}>
                    {section.plans.map((plan, index) => {
                      const Icon = getPlanIcon(plan);
                      const theme = getPlanTheme(plan);
                      const featured = isFeaturedPlan(plan);
                      const benefits = getPlanBenefits(plan).slice(0, 5);

                      return (
                        <article
                          key={plan.id}
                          className={`${styles.planCard} ${
                            theme === "dark"
                              ? styles.planCardDark
                              : styles.planCardLight
                          } ${featured ? styles.planCardFeatured : ""}`}
                          style={{ animationDelay: `${index * 120}ms` }}
                        >
                          {featured ? (
                            <div className={styles.planPopularBadge}>
                              <FaStar />
                              <span>Mas elegido</span>
                            </div>
                          ) : null}

                          <div className={styles.planHeader}>
                            <div className={styles.planIdentity}>
                              <span className={styles.planIconWrap}>
                                <Icon />
                              </span>

                              <div>
                                <h3 className={styles.planName}>{plan.name}</h3>
                                <p className={styles.planBlurb}>
                                  {plan.description ||
                                    "Plan activo del catalogo Titanium."}
                                </p>
                              </div>
                            </div>

                            <div className={styles.planMetaGrid}>
                              <span className={styles.planMetaPill}>
                                <FaCalendarAlt />
                                {formatDurationLabel(getPlanDurationDays(plan))}
                              </span>
                              <span className={styles.planMetaPill}>
                                <FaUsers />
                                {getPeopleLabel(plan)}
                              </span>
                              <span className={styles.planMetaPill}>
                                {getPlanTypeLabel(plan)}
                              </span>
                            </div>

                            <div className={styles.planPriceGroup}>
                              <div className={styles.planPriceLine}>
                                <strong className={styles.planPrice}>
                                  {formatPriceMXN(plan.price)}
                                </strong>
                                <span className={styles.planPriceSuffix}>
                                  {getPlanPriceSuffix(plan)}
                                </span>
                              </div>

                              <p className={styles.planPriceMeta}>
                                {getPlanPriceMeta(plan)}
                              </p>
                            </div>
                          </div>

                          <ul className={styles.featureList}>
                            {benefits.map((benefit) => (
                              <li
                                key={benefit}
                                className={`${styles.featureItem} ${styles.featureItemIncluded}`}
                              >
                                <span
                                  className={`${styles.featureIcon} ${styles.featureIconIncluded}`}
                                >
                                  <FaCheck />
                                </span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>

                          <Link
                            to="/register"
                            className={`${styles.planButton} ${
                              featured
                                ? styles.planButtonFeatured
                                : styles.planButtonNeutral
                            }`}
                          >
                            {plan.type === "group"
                              ? "Solicitar Paquete"
                              : "Comenzar Ahora"}
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          <div className={styles.trustBlock}>
            <p className={styles.trustText}>
              Planes sincronizados con <strong>MembershipPlans</strong> para
              mostrar precios y vigencias reales
            </p>
            <div className={styles.trustRating}>
              <div className={styles.trustStars} aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <FaStar key={`trust-star-${index}`} />
                ))}
              </div>
              <span>Informacion actualizada</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.testimonialSection}>
        <div className={styles.shell}>
          <div className={styles.sectionHeaderDark}>
            <span className={styles.sectionBadgeDark}>Historias reales</span>
            <h2 className={styles.sectionTitleDark}>
              Lo que dicen nuestros <span className={styles.sectionAccent}>Miembros</span>
            </h2>
            <p className={styles.sectionDescriptionDark}>
              Historias de transformacion reales. Unete a miles que ya
              convirtieron el entrenamiento en una rutina que disfrutan.
            </p>
          </div>

          <div className={styles.testimonialStage}>
            <article key={activeTestimonial.id} className={styles.testimonialCard}>
              <div className={styles.testimonialQuoteMark}>
                <FaQuoteRight />
              </div>

              <div className={styles.testimonialTop}>
                <div className={styles.testimonialStars}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <FaStar key={`${activeTestimonial.id}-star-${index}`} />
                  ))}
                </div>

                <p className={styles.testimonialQuote}>
                  "{activeTestimonial.quote}"
                </p>
              </div>

              <div className={styles.testimonialFooter}>
                <div className={styles.memberIdentity}>
                  <div className={styles.memberAvatar}>
                    {getInitials(activeTestimonial.name)}
                  </div>

                  <div className={styles.memberMeta}>
                    <div className={styles.memberNameRow}>
                      <strong className={styles.memberName}>
                        {activeTestimonial.name}
                      </strong>
                      <span className={styles.memberPlan}>
                        {activeTestimonial.plan}
                      </span>
                    </div>
                    <span className={styles.memberTenure}>
                      {activeTestimonial.tenure}
                    </span>
                  </div>
                </div>

                <div className={styles.testimonialControls}>
                  <div className={styles.testimonialDots}>
                    {testimonials.map((testimonial, index) => (
                      <button
                        key={testimonial.id}
                        type="button"
                        className={`${styles.testimonialDot} ${
                          index === activeTestimonialIndex
                            ? styles.testimonialDotActive
                            : ""
                        }`}
                        onClick={() =>
                          startTransition(() => setActiveTestimonialIndex(index))
                        }
                        aria-label={`Mostrar testimonio ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div className={styles.testimonialNav}>
                    <button
                      type="button"
                      className={styles.testimonialNavButton}
                      onClick={goToPreviousTestimonial}
                      aria-label="Testimonio anterior"
                    >
                      <FaChevronLeft />
                    </button>

                    <button
                      type="button"
                      className={`${styles.testimonialNavButton} ${styles.testimonialNavButtonActive}`}
                      onClick={goToNextTestimonial}
                      aria-label="Testimonio siguiente"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.shell}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Preguntas frecuentes</span>
            <h2 className={styles.sectionTitle}>
              Tienes <span className={styles.sectionAccent}>Dudas?</span>
            </h2>
            <p className={styles.sectionDescription}>
              Aqui encuentras respuestas claras a las preguntas mas comunes. Si
              aun no ves lo que buscas, puedes registrarte y nuestro equipo te
              guia.
            </p>
          </div>

          <div className={styles.faqList}>
            {faqs.map((faq, index) => {
              const isOpen = activeFaqIndex === index;

              return (
                <article
                  key={faq.question}
                  className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
                >
                  <button
                    type="button"
                    className={styles.faqButton}
                    onClick={() =>
                      setActiveFaqIndex((currentIndex) =>
                        currentIndex === index ? -1 : index,
                      )
                    }
                    aria-expanded={isOpen}
                  >
                    <span className={styles.faqQuestion}>{faq.question}</span>
                    <span
                      className={`${styles.faqToggle} ${
                        isOpen ? styles.faqToggleOpen : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </button>

                  <div
                    className={`${styles.faqAnswerWrap} ${
                      isOpen ? styles.faqAnswerWrapOpen : ""
                    }`}
                  >
                    <div className={styles.faqAnswerInner}>
                      <p className={styles.faqAnswer}>{faq.answer}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className={styles.faqSupport}>
            <div>
              <span className={styles.faqSupportTag}>Listo para empezar</span>
              <h3 className={styles.faqSupportTitle}>
                Encuentra el plan que mejor se adapta a tu ritmo
              </h3>
            </div>

            <Link to="/register" className={styles.supportButton}>
              Quiero mi membresia
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
