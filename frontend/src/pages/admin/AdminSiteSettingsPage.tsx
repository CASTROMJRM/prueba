import { useState } from "react";
import styles from "./AdminSiteSettingsPage.module.css";

type SiteSettings = {
  slogan: string;
  filosofia: string;
  mision: string;
  vision: string;
  valores: string;
  telefono: string;
  correo: string;
  direccion: string;
  instagram: string;
  facebook: string;
  heroImageUrl: string;
  logoUrl: string;
};

const initial: SiteSettings = {
  slogan: "Tu destino de transformación",
  filosofia: "Aquí va la filosofía del gimnasio...",
  mision: "Aquí va la misión...",
  vision: "Aquí va la visión...",
  valores: "Disciplina, constancia, respeto...",
  telefono: "",
  correo: "",
  direccion: "",
  instagram: "",
  facebook: "",
  heroImageUrl: "",
  logoUrl: "",
};

export default function AdminSiteSettingsPage() {
  const [data, setData] = useState<SiteSettings>(initial);

  const onSave = () => {
    // Luego lo conectamos a backend
    console.log("Guardando settings:", data);
    alert("Guardado (demo). Luego lo conectamos al backend 😉");
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestión del sitio</h1>
          <p className={styles.subtitle}>
            Edita la información pública: filosofía, misión/visión, contacto e
            imágenes.
          </p>
        </div>

        <button className={styles.primaryBtn} onClick={onSave}>
          Guardar cambios
        </button>
      </div>

      <div className={styles.grid}>
        {/* Contenido */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Contenido</h2>

          <label className={styles.field}>
            <span>Slogan</span>
            <input
              value={data.slogan}
              onChange={(e) =>
                setData((p) => ({ ...p, slogan: e.target.value }))
              }
              placeholder="Ej. Tu destino de transformación"
            />
          </label>

          <label className={styles.field}>
            <span>Filosofía</span>
            <textarea
              value={data.filosofia}
              onChange={(e) =>
                setData((p) => ({ ...p, filosofia: e.target.value }))
              }
              placeholder="Describe la filosofía del gimnasio..."
              rows={5}
            />
          </label>

          <div className={styles.twoCols}>
            <label className={styles.field}>
              <span>Misión</span>
              <textarea
                value={data.mision}
                onChange={(e) =>
                  setData((p) => ({ ...p, mision: e.target.value }))
                }
                rows={4}
              />
            </label>

            <label className={styles.field}>
              <span>Visión</span>
              <textarea
                value={data.vision}
                onChange={(e) =>
                  setData((p) => ({ ...p, vision: e.target.value }))
                }
                rows={4}
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Valores</span>
            <textarea
              value={data.valores}
              onChange={(e) =>
                setData((p) => ({ ...p, valores: e.target.value }))
              }
              placeholder="Ej. Disciplina, constancia, respeto..."
              rows={3}
            />
          </label>
        </section>

        {/* Contacto */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Contacto</h2>

          <div className={styles.twoCols}>
            <label className={styles.field}>
              <span>Teléfono</span>
              <input
                value={data.telefono}
                onChange={(e) =>
                  setData((p) => ({ ...p, telefono: e.target.value }))
                }
                placeholder="Ej. +52 33 1234 5678"
              />
            </label>

            <label className={styles.field}>
              <span>Correo</span>
              <input
                value={data.correo}
                onChange={(e) =>
                  setData((p) => ({ ...p, correo: e.target.value }))
                }
                placeholder="Ej. contacto@titanium.com"
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Dirección</span>
            <input
              value={data.direccion}
              onChange={(e) =>
                setData((p) => ({ ...p, direccion: e.target.value }))
              }
              placeholder="Calle, número, colonia, ciudad..."
            />
          </label>

          <div className={styles.twoCols}>
            <label className={styles.field}>
              <span>Instagram</span>
              <input
                value={data.instagram}
                onChange={(e) =>
                  setData((p) => ({ ...p, instagram: e.target.value }))
                }
                placeholder="@titaniumgym"
              />
            </label>

            <label className={styles.field}>
              <span>Facebook</span>
              <input
                value={data.facebook}
                onChange={(e) =>
                  setData((p) => ({ ...p, facebook: e.target.value }))
                }
                placeholder="facebook.com/..."
              />
            </label>
          </div>
        </section>

        {/* Imágenes */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Imágenes</h2>

          <label className={styles.field}>
            <span>Logo (URL)</span>
            <input
              value={data.logoUrl}
              onChange={(e) =>
                setData((p) => ({ ...p, logoUrl: e.target.value }))
              }
              placeholder="https://..."
            />
          </label>

          <label className={styles.field}>
            <span>Imagen principal (Hero) (URL)</span>
            <input
              value={data.heroImageUrl}
              onChange={(e) =>
                setData((p) => ({ ...p, heroImageUrl: e.target.value }))
              }
              placeholder="https://..."
            />
          </label>

          <div className={styles.previewRow}>
            <div className={styles.previewBox}>
              <div className={styles.previewLabel}>Logo</div>
              {data.logoUrl ? (
                <img
                  className={styles.previewImg}
                  src={data.logoUrl}
                  alt="Logo"
                />
              ) : (
                <div className={styles.previewEmpty}>Sin imagen</div>
              )}
            </div>

            <div className={styles.previewBox}>
              <div className={styles.previewLabel}>Hero</div>
              {data.heroImageUrl ? (
                <img
                  className={styles.previewImg}
                  src={data.heroImageUrl}
                  alt="Hero"
                />
              ) : (
                <div className={styles.previewEmpty}>Sin imagen</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
