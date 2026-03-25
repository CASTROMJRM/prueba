import { AboutPage, AboutValue } from "../models/index.js";

export const createAboutValue = async (req, res) => {
  try {
    const page = await AboutPage.findOne({ where: { slug: "main" } });
    if (!page) {
      return res.status(404).json({ error: "AboutPage no encontrada" });
    }

    const count = await AboutValue.count({
      where: { aboutPageId: page.id },
    });

    const item = await AboutValue.create({
      aboutPageId: page.id,
      title: req.body.title,
      description: req.body.description,
      iconKey: req.body.iconKey || "shield",
      order: count,
      isActive: true,
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error("createAboutValue error:", error);
    return res.status(500).json({
      error: "Error al crear valor",
      details: error.message,
    });
  }
};

export const updateAboutValue = async (req, res) => {
  try {
    const item = await AboutValue.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Valor no encontrado" });
    }

    await item.update({
      title: req.body.title ?? item.title,
      description: req.body.description ?? item.description,
      iconKey: req.body.iconKey ?? item.iconKey,
      isActive: req.body.isActive ?? item.isActive,
    });

    return res.json(item);
  } catch (error) {
    console.error("updateAboutValue error:", error);
    return res.status(500).json({
      error: "Error al actualizar valor",
      details: error.message,
    });
  }
};

export const deleteAboutValue = async (req, res) => {
  try {
    const item = await AboutValue.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Valor no encontrado" });
    }

    await item.destroy();
    return res.json({ message: "Valor eliminado correctamente" });
  } catch (error) {
    console.error("deleteAboutValue error:", error);
    return res.status(500).json({
      error: "Error al eliminar valor",
      details: error.message,
    });
  }
};

export const reorderAboutValues = async (req, res) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "order debe ser un arreglo" });
    }

    for (let i = 0; i < order.length; i += 1) {
      const item = await AboutValue.findByPk(order[i]);
      if (item) {
        item.order = i;
        await item.save();
      }
    }

    const items = await AboutValue.findAll({ order: [["order", "ASC"]] });
    return res.json(items);
  } catch (error) {
    console.error("reorderAboutValues error:", error);
    return res.status(500).json({
      error: "Error al reordenar valores",
      details: error.message,
    });
  }
};
