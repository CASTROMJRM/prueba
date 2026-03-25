import { AboutPage, AboutTeamMember } from "../models/index.js";
import {
  destroyCloudinaryImage,
  uploadBufferToCloudinary,
} from "../utils/cloudinaryUpload.js";

export const createAboutTeamMember = async (req, res) => {
  try {
    const page = await AboutPage.findOne({ where: { slug: "main" } });
    if (!page) {
      return res.status(404).json({ error: "AboutPage no encontrada" });
    }

    const count = await AboutTeamMember.count({
      where: { aboutPageId: page.id },
    });

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(
        req.file.buffer,
        "titanium/about/team"
      );
      imageUrl = uploaded.secure_url;
      imagePublicId = uploaded.public_id;
    }

    const member = await AboutTeamMember.create({
      aboutPageId: page.id,
      name: req.body.name,
      role: req.body.role,
      description: req.body.description ?? null,
      imageUrl,
      imagePublicId,
      facebookUrl: req.body.facebookUrl ?? null,
      twitterUrl: req.body.twitterUrl ?? null,
      linkedinUrl: req.body.linkedinUrl ?? null,
      order: count,
      isActive: true,
    });

    return res.status(201).json(member);
  } catch (error) {
    console.error("createAboutTeamMember error:", error);
    return res.status(500).json({
      error: "Error al crear miembro del equipo",
      details: error.message,
    });
  }
};

export const updateAboutTeamMember = async (req, res) => {
  try {
    const member = await AboutTeamMember.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    let updates = {
      name: req.body.name ?? member.name,
      role: req.body.role ?? member.role,
      description: req.body.description ?? member.description,
      facebookUrl: req.body.facebookUrl ?? member.facebookUrl,
      twitterUrl: req.body.twitterUrl ?? member.twitterUrl,
      linkedinUrl: req.body.linkedinUrl ?? member.linkedinUrl,
      isActive: req.body.isActive ?? member.isActive,
    };

    if (req.file) {
      if (member.imagePublicId) {
        await destroyCloudinaryImage(member.imagePublicId);
      }

      const uploaded = await uploadBufferToCloudinary(
        req.file.buffer,
        "titanium/about/team"
      );

      updates.imageUrl = uploaded.secure_url;
      updates.imagePublicId = uploaded.public_id;
    }

    await member.update(updates);
    return res.json(member);
  } catch (error) {
    console.error("updateAboutTeamMember error:", error);
    return res.status(500).json({
      error: "Error al actualizar miembro",
      details: error.message,
    });
  }
};

export const deleteAboutTeamMember = async (req, res) => {
  try {
    const member = await AboutTeamMember.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    if (member.imagePublicId) {
      await destroyCloudinaryImage(member.imagePublicId);
    }

    await member.destroy();
    return res.json({ message: "Miembro eliminado correctamente" });
  } catch (error) {
    console.error("deleteAboutTeamMember error:", error);
    return res.status(500).json({
      error: "Error al eliminar miembro",
      details: error.message,
    });
  }
};

export const reorderAboutTeamMembers = async (req, res) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "order debe ser un arreglo" });
    }

    for (let i = 0; i < order.length; i += 1) {
      const member = await AboutTeamMember.findByPk(order[i]);
      if (member) {
        member.order = i;
        await member.save();
      }
    }

    const items = await AboutTeamMember.findAll({ order: [["order", "ASC"]] });
    return res.json(items);
  } catch (error) {
    console.error("reorderAboutTeamMembers error:", error);
    return res.status(500).json({
      error: "Error al reordenar equipo",
      details: error.message,
    });
  }
};