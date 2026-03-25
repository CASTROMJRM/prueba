import { AboutPage, AboutTeamMember, AboutValue } from "../models/index.js";
import { sequelize } from "../config/sequelize.js";
import {
  destroyCloudinaryImage,
  uploadBufferToCloudinary,
} from "../utils/cloudinaryUpload.js";
import { serializeAboutPage } from "../utils/aboutSerializer.js";

const getFullPage = async () => {
  const page = await AboutPage.findOne({
    where: { slug: "main" },
    include: [
      { model: AboutValue, as: "values", required: false },
      { model: AboutTeamMember, as: "teamMembers", required: false },
    ],
  });

  return page ? serializeAboutPage(page) : null;
};

export const getAdminAboutPage = async (req, res) => {
  try {
    let page = await AboutPage.findOne({
      where: { slug: "main" },
    });

    if (!page) {
      page = await AboutPage.create({
        slug: "main",
        heroLabel: "Nuestra Historia",
        heroTitle: "Acerca de Nosotros",
        heroHighlight: "Nosotros",
        heroSubtitle:
          "Somos mas que un gimnasio, somos una comunidad comprometida con tu bienestar fisico y emocional.",
        introTitle: "Nuestra Pasion por el Fitness",
        introHighlight: "Pasion",
        introText:
          "En Titanium Sport Gym, hemos creado un espacio donde cada persona puede alcanzar su maximo potencial.",
        stat1Value: "500+",
        stat1Label: "Miembros Activos",
        stat2Value: "15+",
        stat2Label: "Entrenadores Certificados",
        stat3Value: "00",
        stat3Label: "Horario de Servicio",
        missionTitle: "Mision",
        visionTitle: "Vision",
        valuesTitle: "Valores",
        ctaTitle: "Listo para transformar tu vida?",
        ctaText:
          "Unete a nuestra comunidad y comienza tu viaje hacia una vida mas saludable y activa.",
        ctaAddress:
          "Av. Corona del Rosal N 15. Col. 5 de mayo. Huejutla, Hidalgo Mexico.",
        ctaPhone: "771 197 6803",
        ctaPrimaryButtonText: "Contactanos",
        ctaPrimaryButtonLink: "/contacto",
        ctaSecondaryButtonText: "Ver Servicios",
        ctaSecondaryButtonLink: "/servicios",
      });
    }

    const full = await getFullPage();
    return res.json(full);
  } catch (error) {
    console.error("getAdminAboutPage error:", error);
    return res.status(500).json({
      error: "Error al obtener About admin",
      details: error.message,
    });
  }
};

export const updateAdminAboutPage = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    let page = await AboutPage.findOne({
      where: { slug: "main" },
      transaction,
    });

    if (!page) {
      page = await AboutPage.create({ slug: "main" }, { transaction });
    }

    const body = req.body || {};
    const files = req.files || {};

    const updates = {
      heroLabel: body.heroLabel ?? page.heroLabel,
      heroTitle: body.heroTitle ?? page.heroTitle,
      heroHighlight: body.heroHighlight ?? page.heroHighlight,
      heroSubtitle: body.heroSubtitle ?? page.heroSubtitle,

      introTitle: body.introTitle ?? page.introTitle,
      introHighlight: body.introHighlight ?? page.introHighlight,
      introText: body.introText ?? page.introText,

      stat1Value: body.stat1Value ?? page.stat1Value,
      stat1Label: body.stat1Label ?? page.stat1Label,
      stat2Value: body.stat2Value ?? page.stat2Value,
      stat2Label: body.stat2Label ?? page.stat2Label,
      stat3Value: body.stat3Value ?? page.stat3Value,
      stat3Label: body.stat3Label ?? page.stat3Label,

      missionTitle: body.missionTitle ?? page.missionTitle,
      missionText: body.missionText ?? page.missionText,
      visionTitle: body.visionTitle ?? page.visionTitle,
      visionText: body.visionText ?? page.visionText,
      valuesTitle: body.valuesTitle ?? page.valuesTitle,
      valuesText: body.valuesText ?? page.valuesText,

      ctaTitle: body.ctaTitle ?? page.ctaTitle,
      ctaText: body.ctaText ?? page.ctaText,
      ctaAddress: body.ctaAddress ?? page.ctaAddress,
      ctaPhone: body.ctaPhone ?? page.ctaPhone,
      ctaPrimaryButtonText:
        body.ctaPrimaryButtonText ?? page.ctaPrimaryButtonText,
      ctaPrimaryButtonLink:
        body.ctaPrimaryButtonLink ?? page.ctaPrimaryButtonLink,
      ctaSecondaryButtonText:
        body.ctaSecondaryButtonText ?? page.ctaSecondaryButtonText,
      ctaSecondaryButtonLink:
        body.ctaSecondaryButtonLink ?? page.ctaSecondaryButtonLink,
    };

    // hero image
    if (files.heroImage?.[0]) {
      if (page.heroImagePublicId) {
        await destroyCloudinaryImage(page.heroImagePublicId);
      }
      const uploaded = await uploadBufferToCloudinary(
        files.heroImage[0].buffer,
        "titanium/about",
      );
      updates.heroImageUrl = uploaded.secure_url;
      updates.heroImagePublicId = uploaded.public_id;
    }

    // intro image
    if (files.introImage?.[0]) {
      if (page.introImagePublicId) {
        await destroyCloudinaryImage(page.introImagePublicId);
      }
      const uploaded = await uploadBufferToCloudinary(
        files.introImage[0].buffer,
        "titanium/about",
      );
      updates.introImageUrl = uploaded.secure_url;
      updates.introImagePublicId = uploaded.public_id;
    }

    // mission image
    if (files.missionImage?.[0]) {
      if (page.missionImagePublicId) {
        await destroyCloudinaryImage(page.missionImagePublicId);
      }
      const uploaded = await uploadBufferToCloudinary(
        files.missionImage[0].buffer,
        "titanium/about",
      );
      updates.missionImageUrl = uploaded.secure_url;
      updates.missionImagePublicId = uploaded.public_id;
    }

    // vision image
    if (files.visionImage?.[0]) {
      if (page.visionImagePublicId) {
        await destroyCloudinaryImage(page.visionImagePublicId);
      }
      const uploaded = await uploadBufferToCloudinary(
        files.visionImage[0].buffer,
        "titanium/about",
      );
      updates.visionImageUrl = uploaded.secure_url;
      updates.visionImagePublicId = uploaded.public_id;
    }

    // values image
    if (files.valuesImage?.[0]) {
      if (page.valuesImagePublicId) {
        await destroyCloudinaryImage(page.valuesImagePublicId);
      }
      const uploaded = await uploadBufferToCloudinary(
        files.valuesImage[0].buffer,
        "titanium/about",
      );
      updates.valuesImageUrl = uploaded.secure_url;
      updates.valuesImagePublicId = uploaded.public_id;
    }

    await page.update(updates, { transaction });
    await transaction.commit();

    const full = await getFullPage();
    return res.json(full);
  } catch (error) {
    await transaction.rollback();
    console.error("updateAdminAboutPage error:", error);
    return res.status(500).json({
      error: "Error al actualizar About",
      details: error.message,
    });
  }
};
