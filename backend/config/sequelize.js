import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

function make(url) {
  return new Sequelize(url, {
    dialect: "postgres",
    logging: false,
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  });
}

//la app normal seguirá usando "sequelize"
export const sequelize = make(process.env.DATABASE_URL_RUNTIME);


export const sequelizeImporter = make(process.env.DATABASE_URL_IMPORTER);
export const sequelizeReports = make(process.env.DATABASE_URL_REPORTS);
