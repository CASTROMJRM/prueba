import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const AboutTeamMember = sequelize.define(
  "AboutTeamMember",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    aboutPageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(140),
      allowNull: false,
    },

    role: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    imageUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },

    imagePublicId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    facebookUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    twitterUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    linkedinUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "AboutTeamMembers",
    schema: "core",
    timestamps: true,
  }
);