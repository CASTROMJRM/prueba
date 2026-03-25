/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import styles from "./AdminAboutPage.module.css";
import {
  createAboutTeamMember,
  createAboutValue,
  deleteAboutTeamMember,
  deleteAboutValue,
  getAdminAboutPage,
  reorderAboutTeamMembers,
  reorderAboutValues,
  updateAboutTeamMember,
  updateAboutValue,
  updateAdminAboutPage,
} from "../../services/admin/aboutAdminService";
import type {
  AboutPageDTO,
  AboutTeamMemberDTO,
  AboutValueDTO,
} from "../../services/aboutService";

type AboutFormState = {
  heroLabel: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;

  introTitle: string;
  introHighlight: string;
  introText: string;

  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;

  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  valuesTitle: string;
  valuesText: string;

  ctaTitle: string;
  ctaText: string;
  ctaAddress: string;
  ctaPhone: string;
  ctaPrimaryButtonText: string;
  ctaPrimaryButtonLink: string;
  ctaSecondaryButtonText: string;
  ctaSecondaryButtonLink: string;
};

const emptyForm: AboutFormState = {
  heroLabel: "",
  heroTitle: "",
  heroHighlight: "",
  heroSubtitle: "",

  introTitle: "",
  introHighlight: "",
  introText: "",

  stat1Value: "",
  stat1Label: "",
  stat2Value: "",
  stat2Label: "",
  stat3Value: "",
  stat3Label: "",

  missionTitle: "",
  missionText: "",
  visionTitle: "",
  visionText: "",
  valuesTitle: "",
  valuesText: "",

  ctaTitle: "",
  ctaText: "",
  ctaAddress: "",
  ctaPhone: "",
  ctaPrimaryButtonText: "",
  ctaPrimaryButtonLink: "",
  ctaSecondaryButtonText: "",
  ctaSecondaryButtonLink: "",
};

const toFormState = (data: AboutPageDTO): AboutFormState => ({
  heroLabel: data.heroLabel ?? "",
  heroTitle: data.heroTitle ?? "",
  heroHighlight: data.heroHighlight ?? "",
  heroSubtitle: data.heroSubtitle ?? "",

  introTitle: data.introTitle ?? "",
  introHighlight: data.introHighlight ?? "",
  introText: data.introText ?? "",

  stat1Value: data.stat1Value ?? "",
  stat1Label: data.stat1Label ?? "",
  stat2Value: data.stat2Value ?? "",
  stat2Label: data.stat2Label ?? "",
  stat3Value: data.stat3Value ?? "",
  stat3Label: data.stat3Label ?? "",

  missionTitle: data.missionTitle ?? "",
  missionText: data.missionText ?? "",
  visionTitle: data.visionTitle ?? "",
  visionText: data.visionText ?? "",
  valuesTitle: data.valuesTitle ?? "",
  valuesText: data.valuesText ?? "",

  ctaTitle: data.ctaTitle ?? "",
  ctaText: data.ctaText ?? "",
  ctaAddress: data.ctaAddress ?? "",
  ctaPhone: data.ctaPhone ?? "",
  ctaPrimaryButtonText: data.ctaPrimaryButtonText ?? "",
  ctaPrimaryButtonLink: data.ctaPrimaryButtonLink ?? "",
  ctaSecondaryButtonText: data.ctaSecondaryButtonText ?? "",
  ctaSecondaryButtonLink: data.ctaSecondaryButtonLink ?? "",
});

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [savingMain, setSavingMain] = useState(false);

  const [about, setAbout] = useState<AboutPageDTO | null>(null);
  const [form, setForm] = useState<AboutFormState>(emptyForm);

  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [introImage, setIntroImage] = useState<File | null>(null);
  const [missionImage, setMissionImage] = useState<File | null>(null);
  const [visionImage, setVisionImage] = useState<File | null>(null);
  const [valuesImage, setValuesImage] = useState<File | null>(null);

  const [valueTitle, setValueTitle] = useState("");
  const [valueDescription, setValueDescription] = useState("");
  const [valueIconKey, setValueIconKey] = useState("shield");

  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [editingValueTitle, setEditingValueTitle] = useState("");
  const [editingValueDescription, setEditingValueDescription] = useState("");
  const [editingValueIconKey, setEditingValueIconKey] = useState("shield");

  const [teamName, setTeamName] = useState("");
  const [teamRole, setTeamRole] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamFacebook, setTeamFacebook] = useState("");
  const [teamTwitter, setTeamTwitter] = useState("");
  const [teamLinkedin, setTeamLinkedin] = useState("");
  const [teamImage, setTeamImage] = useState<File | null>(null);

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberName, setEditingMemberName] = useState("");
  const [editingMemberRole, setEditingMemberRole] = useState("");
  const [editingMemberDescription, setEditingMemberDescription] = useState("");
  const [editingMemberFacebook, setEditingMemberFacebook] = useState("");
  const [editingMemberTwitter, setEditingMemberTwitter] = useState("");
  const [editingMemberLinkedin, setEditingMemberLinkedin] = useState("");
  const [editingMemberImage, setEditingMemberImage] = useState<File | null>(
    null,
  );

  const refreshAbout = async () => {
    setLoading(true);
    try {
      const data = await getAdminAboutPage();
      setAbout(data);
      setForm(toFormState(data));
    } catch (err) {
      console.error("getAdminAboutPage error:", err);
      alert("No se pudo cargar la sección About.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAbout();
  }, []);

  const values = useMemo(() => about?.values ?? [], [about]);
  const teamMembers = useMemo(() => about?.teamMembers ?? [], [about]);

  const updateField = (key: keyof AboutFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveMain = async () => {
    try {
      setSavingMain(true);

      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value ?? "");
      });

      if (heroImage) fd.append("heroImage", heroImage);
      if (introImage) fd.append("introImage", introImage);
      if (missionImage) fd.append("missionImage", missionImage);
      if (visionImage) fd.append("visionImage", visionImage);
      if (valuesImage) fd.append("valuesImage", valuesImage);

      const updated = await updateAdminAboutPage(fd);
      setAbout(updated);
      setForm(toFormState(updated));

      setHeroImage(null);
      setIntroImage(null);
      setMissionImage(null);
      setVisionImage(null);
      setValuesImage(null);

      alert("Contenido principal actualizado correctamente.");
    } catch (err: any) {
      console.error("updateAdminAboutPage error:", err);
      alert(err?.response?.data?.error || "Error al guardar About.");
    } finally {
      setSavingMain(false);
    }
  };

  const handleCreateValue = async () => {
    if (!valueTitle.trim() || !valueDescription.trim()) {
      alert("Completa título y descripción del valor.");
      return;
    }

    try {
      await createAboutValue({
        title: valueTitle,
        description: valueDescription,
        iconKey: valueIconKey,
      });

      setValueTitle("");
      setValueDescription("");
      setValueIconKey("shield");
      await refreshAbout();
    } catch (err: any) {
      console.error("createAboutValue error:", err);
      alert(err?.response?.data?.error || "Error al crear valor.");
    }
  };

  const startEditValue = (item: AboutValueDTO) => {
    setEditingValueId(item.id);
    setEditingValueTitle(item.title);
    setEditingValueDescription(item.description);
    setEditingValueIconKey(item.iconKey || "shield");
  };

  const cancelEditValue = () => {
    setEditingValueId(null);
    setEditingValueTitle("");
    setEditingValueDescription("");
    setEditingValueIconKey("shield");
  };

  const handleSaveValueEdit = async () => {
    if (!editingValueId) return;

    try {
      await updateAboutValue(editingValueId, {
        title: editingValueTitle,
        description: editingValueDescription,
        iconKey: editingValueIconKey,
      });

      cancelEditValue();
      await refreshAbout();
    } catch (err: any) {
      console.error("updateAboutValue error:", err);
      alert(err?.response?.data?.error || "Error al actualizar valor.");
    }
  };

  const handleDeleteValue = async (id: string) => {
    const ok = confirm("¿Eliminar este valor?");
    if (!ok) return;

    try {
      await deleteAboutValue(id);
      await refreshAbout();
    } catch (err: any) {
      console.error("deleteAboutValue error:", err);
      alert(err?.response?.data?.error || "Error al eliminar valor.");
    }
  };

  const moveValue = async (id: string, direction: "up" | "down") => {
    const order = values.map((item) => item.id);
    const index = order.indexOf(id);
    if (index === -1) return;

    const target =
      direction === "up"
        ? Math.max(index - 1, 0)
        : Math.min(index + 1, order.length - 1);

    if (target === index) return;

    [order[index], order[target]] = [order[target], order[index]];

    try {
      await reorderAboutValues(order);
      await refreshAbout();
    } catch (err: any) {
      console.error("reorderAboutValues error:", err);
      alert(err?.response?.data?.error || "Error al reordenar valores.");
    }
  };

  const handleCreateTeamMember = async () => {
    if (!teamName.trim() || !teamRole.trim()) {
      alert("Completa nombre y rol del miembro.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", teamName);
      fd.append("role", teamRole);
      fd.append("description", teamDescription);
      fd.append("facebookUrl", teamFacebook);
      fd.append("twitterUrl", teamTwitter);
      fd.append("linkedinUrl", teamLinkedin);
      if (teamImage) fd.append("image", teamImage);

      await createAboutTeamMember(fd);

      setTeamName("");
      setTeamRole("");
      setTeamDescription("");
      setTeamFacebook("");
      setTeamTwitter("");
      setTeamLinkedin("");
      setTeamImage(null);

      await refreshAbout();
    } catch (err: any) {
      console.error("createAboutTeamMember error:", err);
      alert(err?.response?.data?.error || "Error al crear miembro.");
    }
  };

  const startEditMember = (member: AboutTeamMemberDTO) => {
    setEditingMemberId(member.id);
    setEditingMemberName(member.name);
    setEditingMemberRole(member.role);
    setEditingMemberDescription(member.description ?? "");
    setEditingMemberFacebook(member.facebookUrl ?? "");
    setEditingMemberTwitter(member.twitterUrl ?? "");
    setEditingMemberLinkedin(member.linkedinUrl ?? "");
    setEditingMemberImage(null);
  };

  const cancelEditMember = () => {
    setEditingMemberId(null);
    setEditingMemberName("");
    setEditingMemberRole("");
    setEditingMemberDescription("");
    setEditingMemberFacebook("");
    setEditingMemberTwitter("");
    setEditingMemberLinkedin("");
    setEditingMemberImage(null);
  };

  const handleSaveMemberEdit = async () => {
    if (!editingMemberId) return;

    try {
      const fd = new FormData();
      fd.append("name", editingMemberName);
      fd.append("role", editingMemberRole);
      fd.append("description", editingMemberDescription);
      fd.append("facebookUrl", editingMemberFacebook);
      fd.append("twitterUrl", editingMemberTwitter);
      fd.append("linkedinUrl", editingMemberLinkedin);
      if (editingMemberImage) fd.append("image", editingMemberImage);

      await updateAboutTeamMember(editingMemberId, fd);

      cancelEditMember();
      await refreshAbout();
    } catch (err: any) {
      console.error("updateAboutTeamMember error:", err);
      alert(err?.response?.data?.error || "Error al actualizar miembro.");
    }
  };

  const handleDeleteMember = async (id: string) => {
    const ok = confirm("¿Eliminar este miembro?");
    if (!ok) return;

    try {
      await deleteAboutTeamMember(id);
      await refreshAbout();
    } catch (err: any) {
      console.error("deleteAboutTeamMember error:", err);
      alert(err?.response?.data?.error || "Error al eliminar miembro.");
    }
  };

  const moveMember = async (id: string, direction: "up" | "down") => {
    const order = teamMembers.map((item) => item.id);
    const index = order.indexOf(id);
    if (index === -1) return;

    const target =
      direction === "up"
        ? Math.max(index - 1, 0)
        : Math.min(index + 1, order.length - 1);

    if (target === index) return;

    [order[index], order[target]] = [order[target], order[index]];

    try {
      await reorderAboutTeamMembers(order);
      await refreshAbout();
    } catch (err: any) {
      console.error("reorderAboutTeamMembers error:", err);
      alert(err?.response?.data?.error || "Error al reordenar equipo.");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.empty}>Cargando contenido About...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Acerca de Nosotros</h1>
          <p className={styles.subtitle}>
            Edita el contenido público de la sección About del sitio.
          </p>
        </div>

        <button
          className={styles.primaryBtn}
          type="button"
          onClick={handleSaveMain}
          disabled={savingMain}
        >
          {savingMain ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Hero principal</h2>
          <p className={styles.sectionText}>
            Texto e imagen principal de la ventana.
          </p>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Etiqueta</span>
            <input
              className={styles.input}
              value={form.heroLabel}
              onChange={(e) => updateField("heroLabel", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Título</span>
            <input
              className={styles.input}
              value={form.heroTitle}
              onChange={(e) => updateField("heroTitle", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Palabra resaltada</span>
            <input
              className={styles.input}
              value={form.heroHighlight}
              onChange={(e) => updateField("heroHighlight", e.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Subtítulo</span>
            <textarea
              className={styles.textarea}
              value={form.heroSubtitle}
              onChange={(e) => updateField("heroSubtitle", e.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Imagen hero</span>
            <input
              className={styles.file}
              type="file"
              accept="image/*"
              onChange={(e) => setHeroImage(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {about?.heroImageUrl && (
          <img
            className={styles.preview}
            src={about.heroImageUrl}
            alt="Hero actual"
          />
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Introducción y estadísticas</h2>
          <p className={styles.sectionText}>
            Bloque de presentación y números principales.
          </p>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Título intro</span>
            <input
              className={styles.input}
              value={form.introTitle}
              onChange={(e) => updateField("introTitle", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Palabra resaltada intro</span>
            <input
              className={styles.input}
              value={form.introHighlight}
              onChange={(e) => updateField("introHighlight", e.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Texto intro</span>
            <textarea
              className={styles.textarea}
              value={form.introText}
              onChange={(e) => updateField("introText", e.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Imagen intro</span>
            <input
              className={styles.file}
              type="file"
              accept="image/*"
              onChange={(e) => setIntroImage(e.target.files?.[0] || null)}
            />
          </label>

          <label className={styles.field}>
            <span>Stat 1 valor</span>
            <input
              className={styles.input}
              value={form.stat1Value}
              onChange={(e) => updateField("stat1Value", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Stat 1 etiqueta</span>
            <input
              className={styles.input}
              value={form.stat1Label}
              onChange={(e) => updateField("stat1Label", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Stat 2 valor</span>
            <input
              className={styles.input}
              value={form.stat2Value}
              onChange={(e) => updateField("stat2Value", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Stat 2 etiqueta</span>
            <input
              className={styles.input}
              value={form.stat2Label}
              onChange={(e) => updateField("stat2Label", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Stat 3 valor</span>
            <input
              className={styles.input}
              value={form.stat3Value}
              onChange={(e) => updateField("stat3Value", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Stat 3 etiqueta</span>
            <input
              className={styles.input}
              value={form.stat3Label}
              onChange={(e) => updateField("stat3Label", e.target.value)}
            />
          </label>
        </div>

        {about?.introImageUrl && (
          <img
            className={styles.preview}
            src={about.introImageUrl}
            alt="Intro actual"
          />
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Misión, visión y bloque de valores
          </h2>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Título misión</span>
            <input
              className={styles.input}
              value={form.missionTitle}
              onChange={(e) => updateField("missionTitle", e.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Texto misión</span>
            <textarea
              className={styles.textarea}
              value={form.missionText}
              onChange={(e) => updateField("missionText", e.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Imagen misión</span>
            <input
              className={styles.file}
              type="file"
              accept="image/*"
              onChange={(e) => setMissionImage(e.target.files?.[0] || null)}
            />
          </label>

          <label className={styles.field}>
            <span>Título visión</span>
            <input
              className={styles.input}
              value={form.visionTitle}
              onChange={(e) => updateField("visionTitle", e.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Texto visión</span>
            <textarea
              className={styles.textarea}
              value={form.visionText}
              onChange={(e) => updateField("visionText", e.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Imagen visión</span>
            <input
              className={styles.file}
              type="file"
              accept="image/*"
              onChange={(e) => setVisionImage(e.target.files?.[0] || null)}
            />
          </label>

          <label className={styles.field}>
            <span>Título bloque valores</span>
            <input
              className={styles.input}
              value={form.valuesTitle}
              onChange={(e) => updateField("valuesTitle", e.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Texto bloque valores</span>
            <textarea
              className={styles.textarea}
              value={form.valuesText}
              onChange={(e) => updateField("valuesText", e.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Imagen bloque valores</span>
            <input
              className={styles.file}
              type="file"
              accept="image/*"
              onChange={(e) => setValuesImage(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>CTA final</h2>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Título CTA</span>
            <input
              className={styles.input}
              value={form.ctaTitle}
              onChange={(e) => updateField("ctaTitle", e.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Texto CTA</span>
            <textarea
              className={styles.textarea}
              value={form.ctaText}
              onChange={(e) => updateField("ctaText", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Dirección</span>
            <input
              className={styles.input}
              value={form.ctaAddress}
              onChange={(e) => updateField("ctaAddress", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Teléfono</span>
            <input
              className={styles.input}
              value={form.ctaPhone}
              onChange={(e) => updateField("ctaPhone", e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Texto botón principal</span>
            <input
              className={styles.input}
              value={form.ctaPrimaryButtonText}
              onChange={(e) =>
                updateField("ctaPrimaryButtonText", e.target.value)
              }
            />
          </label>

          <label className={styles.field}>
            <span>Link botón principal</span>
            <input
              className={styles.input}
              value={form.ctaPrimaryButtonLink}
              onChange={(e) =>
                updateField("ctaPrimaryButtonLink", e.target.value)
              }
            />
          </label>

          <label className={styles.field}>
            <span>Texto botón secundario</span>
            <input
              className={styles.input}
              value={form.ctaSecondaryButtonText}
              onChange={(e) =>
                updateField("ctaSecondaryButtonText", e.target.value)
              }
            />
          </label>

          <label className={styles.field}>
            <span>Link botón secundario</span>
            <input
              className={styles.input}
              value={form.ctaSecondaryButtonLink}
              onChange={(e) =>
                updateField("ctaSecondaryButtonLink", e.target.value)
              }
            />
          </label>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Valores</h2>
            <p className={styles.sectionText}>
              Agrega, edita, elimina y ordena.
            </p>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Título</span>
              <input
                className={styles.input}
                value={valueTitle}
                onChange={(e) => setValueTitle(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Icon key</span>
              <input
                className={styles.input}
                value={valueIconKey}
                onChange={(e) => setValueIconKey(e.target.value)}
                placeholder="shield, heart, users..."
              />
            </label>

            <label className={`${styles.field} ${styles.full}`}>
              <span>Descripción</span>
              <textarea
                className={styles.textarea}
                value={valueDescription}
                onChange={(e) => setValueDescription(e.target.value)}
              />
            </label>
          </div>

          <div className={styles.actionsBar}>
            <button
              className={styles.primaryBtn}
              type="button"
              onClick={handleCreateValue}
            >
              Agregar valor
            </button>
          </div>

          <div className={styles.list}>
            {values.length === 0 ? (
              <div className={styles.empty}>No hay valores registrados.</div>
            ) : (
              values.map((item, index) => (
                <div key={item.id} className={styles.listCard}>
                  {editingValueId === item.id ? (
                    <>
                      <div className={styles.formGrid}>
                        <label className={styles.field}>
                          <span>Título</span>
                          <input
                            className={styles.input}
                            value={editingValueTitle}
                            onChange={(e) =>
                              setEditingValueTitle(e.target.value)
                            }
                          />
                        </label>

                        <label className={styles.field}>
                          <span>Icon key</span>
                          <input
                            className={styles.input}
                            value={editingValueIconKey}
                            onChange={(e) =>
                              setEditingValueIconKey(e.target.value)
                            }
                          />
                        </label>

                        <label className={`${styles.field} ${styles.full}`}>
                          <span>Descripción</span>
                          <textarea
                            className={styles.textarea}
                            value={editingValueDescription}
                            onChange={(e) =>
                              setEditingValueDescription(e.target.value)
                            }
                          />
                        </label>
                      </div>

                      <div className={styles.actions}>
                        <button
                          className={styles.btnGhost}
                          onClick={handleSaveValueEdit}
                        >
                          Guardar
                        </button>
                        <button
                          className={styles.btnGhost}
                          onClick={cancelEditValue}
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className={styles.itemTitle}>
                          {index + 1}. {item.title}
                        </div>
                        <div className={styles.itemMeta}>
                          Icono: {item.iconKey || "shield"}
                        </div>
                        <div className={styles.itemText}>
                          {item.description}
                        </div>
                      </div>

                      <div className={styles.actions}>
                        <button
                          className={styles.btnGhost}
                          onClick={() => moveValue(item.id, "up")}
                        >
                          ↑
                        </button>
                        <button
                          className={styles.btnGhost}
                          onClick={() => moveValue(item.id, "down")}
                        >
                          ↓
                        </button>
                        <button
                          className={styles.btnGhost}
                          onClick={() => startEditValue(item)}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.btnDanger}
                          onClick={() => handleDeleteValue(item.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Equipo</h2>
            <p className={styles.sectionText}>
              Gestiona integrantes y sus fotos.
            </p>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Nombre</span>
              <input
                className={styles.input}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Rol</span>
              <input
                className={styles.input}
                value={teamRole}
                onChange={(e) => setTeamRole(e.target.value)}
              />
            </label>

            <label className={`${styles.field} ${styles.full}`}>
              <span>Descripción</span>
              <textarea
                className={styles.textarea}
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Facebook</span>
              <input
                className={styles.input}
                value={teamFacebook}
                onChange={(e) => setTeamFacebook(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Twitter</span>
              <input
                className={styles.input}
                value={teamTwitter}
                onChange={(e) => setTeamTwitter(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>LinkedIn</span>
              <input
                className={styles.input}
                value={teamLinkedin}
                onChange={(e) => setTeamLinkedin(e.target.value)}
              />
            </label>

            <label className={`${styles.field} ${styles.full}`}>
              <span>Imagen</span>
              <input
                className={styles.file}
                type="file"
                accept="image/*"
                onChange={(e) => setTeamImage(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div className={styles.actionsBar}>
            <button
              className={styles.primaryBtn}
              type="button"
              onClick={handleCreateTeamMember}
            >
              Agregar miembro
            </button>
          </div>

          <div className={styles.list}>
            {teamMembers.length === 0 ? (
              <div className={styles.empty}>No hay miembros registrados.</div>
            ) : (
              teamMembers.map((member, index) => (
                <div key={member.id} className={styles.listCard}>
                  {editingMemberId === member.id ? (
                    <>
                      <div className={styles.formGrid}>
                        <label className={styles.field}>
                          <span>Nombre</span>
                          <input
                            className={styles.input}
                            value={editingMemberName}
                            onChange={(e) =>
                              setEditingMemberName(e.target.value)
                            }
                          />
                        </label>

                        <label className={styles.field}>
                          <span>Rol</span>
                          <input
                            className={styles.input}
                            value={editingMemberRole}
                            onChange={(e) =>
                              setEditingMemberRole(e.target.value)
                            }
                          />
                        </label>

                        <label className={`${styles.field} ${styles.full}`}>
                          <span>Descripción</span>
                          <textarea
                            className={styles.textarea}
                            value={editingMemberDescription}
                            onChange={(e) =>
                              setEditingMemberDescription(e.target.value)
                            }
                          />
                        </label>

                        <label className={styles.field}>
                          <span>Facebook</span>
                          <input
                            className={styles.input}
                            value={editingMemberFacebook}
                            onChange={(e) =>
                              setEditingMemberFacebook(e.target.value)
                            }
                          />
                        </label>

                        <label className={styles.field}>
                          <span>Twitter</span>
                          <input
                            className={styles.input}
                            value={editingMemberTwitter}
                            onChange={(e) =>
                              setEditingMemberTwitter(e.target.value)
                            }
                          />
                        </label>

                        <label className={styles.field}>
                          <span>LinkedIn</span>
                          <input
                            className={styles.input}
                            value={editingMemberLinkedin}
                            onChange={(e) =>
                              setEditingMemberLinkedin(e.target.value)
                            }
                          />
                        </label>

                        <label className={`${styles.field} ${styles.full}`}>
                          <span>Nueva imagen</span>
                          <input
                            className={styles.file}
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setEditingMemberImage(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                      </div>

                      <div className={styles.actions}>
                        <button
                          className={styles.btnGhost}
                          onClick={handleSaveMemberEdit}
                        >
                          Guardar
                        </button>
                        <button
                          className={styles.btnGhost}
                          onClick={cancelEditMember}
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.memberRow}>
                        <img
                          className={styles.memberImage}
                          src={
                            member.imageUrl || "https://via.placeholder.com/64"
                          }
                          alt={member.name}
                        />
                        <div>
                          <div className={styles.itemTitle}>
                            {index + 1}. {member.name}
                          </div>
                          <div className={styles.itemMeta}>{member.role}</div>
                          <div className={styles.itemText}>
                            {member.description || "Sin descripción."}
                          </div>
                        </div>
                      </div>

                      <div className={styles.actions}>
                        <button
                          className={styles.btnGhost}
                          onClick={() => moveMember(member.id, "up")}
                        >
                          ↑
                        </button>
                        <button
                          className={styles.btnGhost}
                          onClick={() => moveMember(member.id, "down")}
                        >
                          ↓
                        </button>
                        <button
                          className={styles.btnGhost}
                          onClick={() => startEditMember(member)}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.btnDanger}
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
