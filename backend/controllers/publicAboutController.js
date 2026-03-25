import { AboutPage, AboutTeamMember, AboutValue } from "../models/index.js";
import { serializeAboutPage } from "../utils/aboutSerializer.js";

export const getPublicAboutPage = async (req, res) => {
  try {
    const page = await AboutPage.findOne({
      where: { slug: "main", isActive: true },
      include: [
        {
          model: AboutValue,
          as: "values",
          where: { isActive: true },
          required: false,
        },
        {
          model: AboutTeamMember,
          as: "teamMembers",
          where: { isActive: true },
          required: false,
        },
      ],
    });

    if (!page) {
      return res.status(404).json({ error: "Contenido About no encontrado" });
    }

    return res.json(serializeAboutPage(page));
  } catch (error) {
    console.error("getPublicAboutPage error:", error);
    return res.status(500).json({
      error: "Error al obtener About",
      details: error.message,
    });
  }
};