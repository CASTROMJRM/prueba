import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";
import Logo from "../assets/LogoP.png";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="auth-layout">
      {/* Header */}
      <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
        <div className="header-content">
          <div className="logo-container">
            <Link to="/">
              <img src={Logo} alt="Titanium Sport Gym" className="logo-image" />
            </Link>
          </div>

          <nav className="nav-desktop">
            <div className="nav-main-links">
              <Link to="/" className="nav-link">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                INICIO
                <span className="nav-underline" />
              </Link>
              <a href="#" className="nav-link">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                PRODUCTOS
                <span className="nav-underline" />
              </a>
              <a href="#" className="nav-link">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                SUSCRIPCIONES
                <span className="nav-underline" />
              </a>
              <a href="#" className="nav-link">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                ACERCA DE NOSOTROS
                <span className="nav-underline" />
              </a>
            </div>

            <div className="nav-action-links">
              <div className="nav-divider" />
              <a href="/register" className="slider-btn-outline">
                SUSCRIBETE
              </a>
              <Link to="/login" className="slider-btn-solid">
                INICIA SESIÓN
              </Link>
            </div>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <nav className="mobile-nav">
              <Link to="/" className="mobile-nav-link">
                INICIO
              </Link>
              <a href="#" className="mobile-nav-link">
                PRODUCTOS
              </a>
              <a href="#" className="mobile-nav-link">
                SERVICIOS
              </a>
              <a href="#" className="mobile-nav-link">
                ACERCA DE NOSOTROS
              </a>
              <div className="mobile-nav-buttons">
                <a href="#" className="slider-btn-outline">
                  Registrate
                </a>
                <Link to="/login" className="slider-btn-solid">
                  Inicia Sesión
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content - 50/50 Layout */}
      <main className="auth-main">
        <div className="auth-page">
          {/* Sección de Imagen (Izquierda) */}
          <div className="auth-image-section">
            <div className="auth-image-overlay">
              <h1 className="auth-image-title"></h1>
              <p className="auth-image-subtitle"></p>
            </div>
          </div>

          {/* Sección del Formulario (Derecha) */}
          <div className="auth-form-section">
            <div className="auth-form-container">
              <h1 className="auth-title">Iniciar Sesión</h1>
              <p className="auth-subtitle">
                Accede a tu cuenta de Titanium Sport Gym
              </p>

              <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
                {/* Email */}
                <div className="auth-input-group">
                  <label className="auth-label" htmlFor="email">
                    Correo Electrónico
                  </label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" className="auth-icon">
                        <path
                          d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2zm0 2l8 5 8-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="auth-input"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="auth-input-group">
                  <label className="auth-label" htmlFor="password">
                    Contraseña
                  </label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" className="auth-icon">
                        <path
                          d="M7 10V8a5 5 0 1110 0v2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <rect
                          x="5"
                          y="10"
                          width="14"
                          height="10"
                          rx="2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="auth-input"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" className="auth-icon">
                          <path
                            d="M3 3l18 18"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58M9.88 5.08A10.8 10.8 0 0112 5c7 0 10 7 10 7a17.9 17.9 0 01-3.18 4.19M6.12 6.12A17.9 17.9 0 002 12s3 7 10 7a10.9 10.9 0 004.67-1.02"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="auth-icon">
                          <path
                            d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Row: remember + forgot */}
                <div className="auth-row">
                  <label className="auth-remember">
                    <input type="checkbox" />
                    <span>Recordarme</span>
                  </label>

                  <a className="auth-link" href="#">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <Link to="/#" style={{ textDecoration: "none" }}>
                  <button className="auth-btn-primary">Iniciar Sesión</button>
                </Link>

                {/* Footer link */}
                <p className="auth-footer">
                  ¿No tienes una cuenta?{" "}
                  <Link to="/register" className="auth-link-strong">
                    Regístrate aquí
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Ahora en la parte inferior */}
      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-inner">
            <span className="footer-text">
              © {new Date().getFullYear()} Titanium Sport Gym. Todos los
              derechos reservados.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
