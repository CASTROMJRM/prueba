import { useState, type FormEvent } from "react";
import axios from "axios";
import { API } from "../../api/api";
import styles from "./AdminUsersPage.module.css";

interface RegisteredTrainerData {
  email: string;
  generatedPassword: string;
}

export default function AdminUsersPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [registeredTrainer, setRegisteredTrainer] =
    useState<RegisteredTrainerData | null>(null);

  const handleRegisterTrainer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setRegisteredTrainer(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data } = await API.post("/admin/users/register-trainer", {
        email: normalizedEmail,
      });

      setRegisteredTrainer({
        email: data.email,
        generatedPassword: data.generatedPassword,
      });
      setSuccessMessage(
        "Entrenador registrado correctamente. Comparte la clave temporal por un canal seguro.",
      );
      setEmail("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          String(
            error.response?.data?.error ||
              "No se pudo registrar al entrenador.",
          ),
        );
      } else {
        setErrorMessage("No se pudo registrar al entrenador.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!registeredTrainer?.generatedPassword) return;

    try {
      await navigator.clipboard.writeText(registeredTrainer.generatedPassword);
      setSuccessMessage("Contrasena temporal copiada al portapapeles.");
    } catch {
      setErrorMessage("No se pudo copiar la contrasena automaticamente.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Usuarios admin</span>
          <h1 className={styles.title}>Registro de entrenadores</h1>
          <p className={styles.subtitle}>
            El administrador solo captura el correo del entrenador. El sistema
            genera una contrasena temporal y obliga al cambio en el primer
            acceso.
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        <section className={styles.content}>
          <form onSubmit={handleRegisterTrainer} className={styles.form}>
            <label className={styles.field}>
              <span>Correo del entrenador</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="entrenador@correo.com"
                required
              />
            </label>

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar entrenador"}
            </button>
          </form>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          {successMessage && <p className={styles.success}>{successMessage}</p>}
        </section>

        <aside className={styles.sideCard}>
          <h2>Flujo esperado</h2>
          <ol className={styles.steps}>
            <li>El administrador captura el correo que le comparte el entrenador.</li>
            <li>El sistema genera una contrasena temporal con la politica actual.</li>
            <li>El administrador entrega esa contrasena al entrenador.</li>
            <li>En el primer login, el entrenador debe cambiarla antes de entrar.</li>
          </ol>
        </aside>
      </div>

      {registeredTrainer && (
        <section className={styles.credentialsCard}>
          <div>
            <span className={styles.credentialsLabel}>Credenciales temporales</span>
            <h2 className={styles.credentialsTitle}>Entrenador listo para ingresar</h2>
          </div>

          <div className={styles.credentialsGrid}>
            <div className={styles.credentialField}>
              <span>Correo</span>
              <strong>{registeredTrainer.email}</strong>
            </div>

            <div className={styles.credentialField}>
              <span>Contrasena temporal</span>
              <strong>{registeredTrainer.generatedPassword}</strong>
            </div>
          </div>

          <div className={styles.credentialsActions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleCopyPassword}
            >
              Copiar contrasena
            </button>
            <p className={styles.helper}>
              Compartela por un canal seguro. El sistema pedira reemplazarla en
              el primer acceso.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
