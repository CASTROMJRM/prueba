import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const AboutValue = sequelize.define(
  "AboutValue",
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

    title: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    iconKey: {
      type: DataTypes.STRING(80),
      allowNull: true,
      defaultValue: "shield",
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
    tableName: "AboutValues",
    schema: "core",
    timestamps: true,
  }
);