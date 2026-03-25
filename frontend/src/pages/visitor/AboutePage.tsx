import { useEffect, useMemo, useState, type JSX } from "react";
import { Link } from "react-router-dom";
import {
  FaBullseye,
  FaDumbbell,
  FaEye,
  FaFacebookF,
  FaHandshake,
  FaHeart,
  FaInstagram,
  FaLinkedinIn,
  FaShieldAlt,
  FaStar,
  FaTwitter,
  FaUsers,
} from "react-icons/fa";
import styles from "./AboutePage.module.css";
import { getAboutPage, type AboutPageDTO } from "../../services/aboutService";

const cx = (...names: Array<string | null | undefined | false>) =>
  names
    .flatMap((name) => (name ? name.split(" ") : []))
    .map((name) => styles[name])
    .filter(Boolean)
    .join(" ");

const iconMap: Record<string, JSX.Element> = {
  shield: <FaShieldAlt />,
  heart: <FaHeart />,
  users: <FaUsers />,
  star: <FaStar />,
  target: <FaBullseye />,
  eye: <FaEye />,
  handshake: <FaHandshake />,
  dumbbell: <FaDumbbell />,
};

const getValueIcon = (iconKey?: string | null) => {
  if (!iconKey) return <FaShieldAlt />;
  return iconMap[iconKey.toLowerCase()] || <FaShieldAlt />;
};

const fallbackImage =
  "https://via.placeholder.com/900x700?text=Titanium+Sport+Gym";

const renderHighlightedTitle = (
  fullText?: string | null,
  highlight?: string | null
) => {
  const safeText = fullText || "";
  const safeHighlight = highlight || "";

  if (!safeHighlight || !safeText.includes(safeHighlight)) {
    return safeText;
  }

  const [before, after] = safeText.split(safeHighlight);

  return (
    <>
      {before}
      <span className={cx("text-red")}>{safeHighlight}</span>
      {after}
    </>
  );
};

export default function AboutUs() {
  const [about, setAbout] = useState<AboutPageDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAbout = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAboutPage();
        setAbout(data);
      } catch (err) {
        console.error("Error cargando About:", err);
        setError("No se pudo cargar la información.");
      } finally {
        setLoading(false);
      }
    };

    loadAbout();
  }, []);

  const values = useMemo(() => about?.values || [], [about]);
  const teamMembers = useMemo(() => about?.teamMembers || [], [about]);

  if (loading) {
    return (
      <main className={cx("about-us-section")}>
        <div className={cx("about-container")}>
          <section className={cx("about-header")}>
            <span className={cx("about-label")}>Acerca de Nosotros</span>
            <h2 className={cx("brush-title")}>Cargando información...</h2>
            <p className={cx("intro-text")}>
              Estamos obteniendo el contenido de esta sección.
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (error || !about) {
    return (
      <main className={cx("about-us-section")}>
        <div className={cx("about-container")}>
          <section className={cx("about-header")}>
            <span className={cx("about-label")}>Acerca de Nosotros</span>
            <h2 className={cx("brush-title")}>Ocurrió un problema</h2>
            <p className={cx("intro-text")}>
              {error || "No se encontró contenido para esta página."}
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={cx("about-us-section")}>
      <div className={cx("bg-animation")}>
        <div className={cx("bg-grid")} />
        <div className={cx("bg-glow", "bg-glow-1")} />
        <div className={cx("bg-glow", "bg-glow-2")} />
      </div>

      <div className={cx("about-container")}>
        {/* HERO / HEADER */}
        <section className={cx("header-image-container")}>
          <img
            src={about.heroImageUrl || fallbackImage}
            alt={about.heroTitle || "Acerca de Titanium Sport Gym"}
            className={cx("header-background-image")}
          />
          <div className={cx("header-overlay")} />

          <div className={cx("header-content")}>
            <div className={cx("about-header")}>
              <span className={cx("about-label")}>
                {about.heroLabel || "Acerca de Nosotros"}
              </span>

              <h1 className={cx("brush-title")}>
                {renderHighlightedTitle(about.heroTitle, about.heroHighlight)}
              </h1>

              <p className={cx("about-subtitle")}>
                {about.heroSubtitle ||
                  "Somos una comunidad comprometida con tu crecimiento, disciplina y bienestar."}
              </p>

              <div className={cx("cta-buttons")} style={{ marginTop: "2rem" }}>
                <Link to="/contacto" className={cx("cta-btn-primary")}>
                  Conócenos
                </Link>
                <Link to="/servicios" className={cx("cta-btn-secondary")}>
                  Ver servicios
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className={cx("intro-section")}>
          <div className={cx("intro-content")}>
            <span className={cx("about-label")}>Titanium Sport Gym</span>

            <h2 className={cx("brush-title")}>
              {renderHighlightedTitle(about.introTitle, about.introHighlight)}
            </h2>

            <p className={cx("intro-text")}>
              {about.introText ||
                "Creamos un espacio donde cada persona puede superarse y construir una mejor versión de sí misma."}
            </p>

            <div className={cx("intro-stats")}>
              <article className={cx("stat-item")}>
                <strong className={cx("stat-value")}>
                  {about.stat1Value || "500+"}
                </strong>
                <span className={cx("stat-label")}>
                  {about.stat1Label || "Miembros Activos"}
                </span>
              </article>

              <article className={cx("stat-item")}>
                <strong className={cx("stat-value")}>
                  {about.stat2Value || "15+"}
                </strong>
                <span className={cx("stat-label")}>
                  {about.stat2Label || "Entrenadores Certificados"}
                </span>
              </article>

              <article className={cx("stat-item")}>
                <strong className={cx("stat-value")}>
                  {about.stat3Value || "24/7"}
                </strong>
                <span className={cx("stat-label")}>
                  {about.stat3Label || "Compromiso Total"}
                </span>
              </article>
            </div>
          </div>

          <div className={cx("intro-image")}>
            <img
              src={about.introImageUrl || fallbackImage}
              alt={about.introTitle || "Nuestra pasión por el fitness"}
              className={cx("intro-img")}
            />
          </div>
        </section>

        {/* MISIÓN / VISIÓN / VALORES */}
        <section className={cx("mv-grid")}>
          <article className={cx("mv-card")}>
            <div className={cx("mv-glow")} />
            <div className={cx("mv-image")}>
              <img
                src={about.missionImageUrl || fallbackImage}
                alt={about.missionTitle || "Misión"}
              />
            </div>
            <div className={cx("mv-content")}>
              <span className={cx("mv-icon")}>
                <FaBullseye />
              </span>
              <h3 className={cx("mv-title")}>
                {about.missionTitle || "Misión"}
              </h3>
              <p className={cx("mv-description")}>
                {about.missionText ||
                  "Inspirar a cada persona a desarrollar fuerza, salud y disciplina a través de un acompañamiento profesional."}
              </p>
            </div>
          </article>

          <article className={cx("mv-card")}>
            <div className={cx("mv-glow")} />
            <div className={cx("mv-image")}>
              <img
                src={about.visionImageUrl || fallbackImage}
                alt={about.visionTitle || "Visión"}
              />
            </div>
            <div className={cx("mv-content")}>
              <span className={cx("mv-icon")}>
                <FaEye />
              </span>
              <h3 className={cx("mv-title")}>
                {about.visionTitle || "Visión"}
              </h3>
              <p className={cx("mv-description")}>
                {about.visionText ||
                  "Ser un referente regional en entrenamiento, bienestar y transformación física con impacto real en nuestra comunidad."}
              </p>
            </div>
          </article>

          <article className={cx("mv-card")}>
            <div className={cx("mv-glow")} />
            <div className={cx("mv-image")}>
              <img
                src={about.valuesImageUrl || fallbackImage}
                alt={about.valuesTitle || "Valores"}
              />
            </div>
            <div className={cx("mv-content")}>
              <span className={cx("mv-icon")}>
                <FaHandshake />
              </span>
              <h3 className={cx("mv-title")}>
                {about.valuesTitle || "Valores"}
              </h3>
              <p className={cx("mv-description")}>
                {about.valuesText ||
                  "Nos guiamos por compromiso, respeto, disciplina y pasión por ayudar a otros a crecer."}
              </p>
            </div>
          </article>
        </section>

        {/* VALORES */}
        <section className={cx("values-section")}>
          <div className={cx("about-header")}>
            <span className={cx("about-label")}>Nuestros principios</span>
            <h2 className={cx("brush-title")}>
              Lo que define nuestra forma de trabajar
            </h2>
            <p className={cx("intro-text")}>
              Cada entrenamiento, cada recomendación y cada espacio dentro del
              gimnasio refleja nuestra identidad.
            </p>
          </div>

          <div className={cx("values-grid")}>
            {values.length > 0 ? (
              values.map((value) => (
                <article key={value.id} className={cx("value-card")}>
                  <span className={cx("value-icon")}>
                    {getValueIcon(value.iconKey)}
                  </span>
                  <div className={cx("value-content")}>
                    <h3 className={cx("value-title")}>{value.title}</h3>
                    <p className={cx("value-description")}>
                      {value.description}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <article className={cx("value-card")}>
                <span className={cx("value-icon")}>
                  <FaShieldAlt />
                </span>
                <div className={cx("value-content")}>
                  <h3 className={cx("value-title")}>Compromiso</h3>
                  <p className={cx("value-description")}>
                    Trabajamos con constancia para brindar una experiencia real
                    de transformación.
                  </p>
                </div>
              </article>
            )}
          </div>
        </section>

        {/* TEAM */}
        <section className={cx("team-section")}>
          <div className={cx("about-header")}>
            <span className={cx("about-label")}>Nuestro equipo</span>
            <h2 className={cx("brush-title")}>
              Personas que impulsan Titanium
            </h2>
            <p className={cx("intro-text")}>
              Profesionales comprometidos con ayudarte a alcanzar tus metas.
            </p>
          </div>

          <div className={cx("team-grid")}>
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <article key={member.id} className={cx("team-card")}>
                  <div className={cx("team-image")}>
                    <img
                      src={member.imageUrl || fallbackImage}
                      alt={member.name}
                    />
                    <div className={cx("team-overlay")} />
                  </div>

                  <div className={cx("team-content")}>
                    <h3 className={cx("team-name")}>{member.name}</h3>
                    <span className={cx("team-role")}>{member.role}</span>
                    <p className={cx("team-description")}>
                      {member.description ||
                        "Miembro del equipo Titanium Sport Gym."}
                    </p>

                    <div className={cx("team-social")}>
                      {member.facebookUrl && (
                        <a
                          href={member.facebookUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={cx("social-icon")}
                          aria-label={`Facebook de ${member.name}`}
                        >
                          <FaFacebookF />
                        </a>
                      )}

                      {member.twitterUrl && (
                        <a
                          href={member.twitterUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={cx("social-icon")}
                          aria-label={`Twitter de ${member.name}`}
                        >
                          <FaTwitter />
                        </a>
                      )}

                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={cx("social-icon")}
                          aria-label={`LinkedIn de ${member.name}`}
                        >
                          <FaLinkedinIn />
                        </a>
                      )}

                      {!member.facebookUrl &&
                        !member.twitterUrl &&
                        !member.linkedinUrl && (
                          <span className={cx("social-icon")}>
                            <FaInstagram />
                          </span>
                        )}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <article className={cx("team-card")}>
                <div className={cx("team-image")}>
                  <img src={fallbackImage} alt="Equipo Titanium" />
                  <div className={cx("team-overlay")} />
                </div>

                <div className={cx("team-content")}>
                  <h3 className={cx("team-name")}>Titanium Team</h3>
                  <span className={cx("team-role")}>
                    Equipo de entrenamiento
                  </span>
                  <p className={cx("team-description")}>
                    Un equipo preparado para acompañarte en tu proceso.
                  </p>
                </div>
              </article>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className={cx("cta-section-about")}>
          <div className={cx("cta-card")}>
            <div className={cx("cta-bg-1")} />
            <div className={cx("cta-bg-2")} />

            <div className={cx("cta-content")}>
              <span className={cx("about-label")}>Da el siguiente paso</span>

              <h2 className={cx("brush-text")}>
                {about.ctaTitle || "¿Listo para transformar tu vida?"}
              </h2>

              <p className={cx("cta-description")}>
                {about.ctaText ||
                  "Únete a Titanium Sport Gym y comienza hoy tu camino hacia una mejor versión de ti."}
              </p>

              <div className={cx("cta-info")}>
                {about.ctaAddress && (
                  <div className={cx("info-item")}>
                    <strong>Dirección:</strong>
                    <span>{about.ctaAddress}</span>
                  </div>
                )}

                {about.ctaPhone && (
                  <div className={cx("info-item")}>
                    <strong>Teléfono:</strong>
                    <span>{about.ctaPhone}</span>
                  </div>
                )}
              </div>

              <div className={cx("cta-buttons")}>
                <Link
                  to={about.ctaPrimaryButtonLink || "/contacto"}
                  className={cx("cta-btn-primary")}
                >
                  {about.ctaPrimaryButtonText || "Contáctanos"}
                </Link>

                <Link
                  to={about.ctaSecondaryButtonLink || "/servicios"}
                  className={cx("cta-btn-secondary")}
                >
                  {about.ctaSecondaryButtonText || "Ver servicios"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}