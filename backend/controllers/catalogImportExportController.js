import { sequelizeImporter, sequelizeReports } from "../config/sequelize.js";
import { parse } from "csv-parse/sync";
import { Parser } from "json2csv";
import crypto from "crypto";

/* =========================================================
   EXPORTAR CATÁLOGO A CSV
========================================================= */
export const exportProductsCsv = async (req, res) => {
  try {
    const [rows] = await sequelizeReports.query(`
      SELECT
        p.id_producto,
        p.name,
        p."brandId",
        b.name AS "brandName",
        p."categoryId",
        c.name AS "categoryName",
        p.price,
        p.stock,
        p.status,
        p."productType",
        p.description,
        p.features,
        p."imageUrl",
        p."supplementFlavor",
        p."supplementPresentation",
        p."supplementServings",
        p."apparelSize",
        p."apparelColor",
        p."apparelMaterial",
        p."createdAt",
        p."updatedAt"
      FROM core."Products" p
      LEFT JOIN core."Brands" b
        ON p."brandId" = b.id_marca
      LEFT JOIN core."Categories" c
        ON p."categoryId" = c.id_categoria
      ORDER BY p.id_producto ASC;
    `);

    const normalized = rows.map((row) => ({
      ...row,
      features: row.features ?? "[]",
    }));

    const fields = [
      "id_producto",
      "name",
      "brandId",
      "brandName",
      "categoryId",
      "categoryName",
      "price",
      "stock",
      "status",
      "productType",
      "description",
      "features",
      "imageUrl",
      "supplementFlavor",
      "supplementPresentation",
      "supplementServings",
      "apparelSize",
      "apparelColor",
      "apparelMaterial",
      "createdAt",
      "updatedAt",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(normalized);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="catalogo_productos.csv"`
    );

    return res.status(200).send(csv);
  } catch (error) {
    console.error("exportProductsCsv error:", error);
    return res.status(500).json({
      error: "Error exportando catálogo",
      details: error.message,
    });
  }
};

/* =========================================================
   SUBIR CSV A STAGING
========================================================= */
export const uploadProductsCsv = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: "Debes enviar un archivo CSV" });
    }

    const csvText = req.file.buffer.toString("utf-8");
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!records.length) {
      return res.status(400).json({ error: "El archivo CSV está vacío" });
    }

    const batchId = crypto.randomUUID();

    // limpiar errores previos del lote por seguridad
    await sequelizeImporter.query(
      `DELETE FROM staging.import_errors WHERE batch_id = :batchId`,
      { replacements: { batchId } }
    );

    const rows = records.map((row, index) => ({
      batch_id: batchId,
      row_num: index + 2, // +2 por encabezado CSV
      id_producto:
        row.id_producto !== undefined && row.id_producto !== ""
          ? Number(row.id_producto)
          : null,
      name: row.name || null,
      brandId:
        row.brandId !== undefined && row.brandId !== ""
          ? Number(row.brandId)
          : null,
      categoryId:
        row.categoryId !== undefined && row.categoryId !== ""
          ? Number(row.categoryId)
          : null,
      price:
        row.price !== undefined && row.price !== ""
          ? Number(row.price)
          : null,
      stock:
        row.stock !== undefined && row.stock !== ""
          ? Number(row.stock)
          : null,
      status: row.status || null,
      productType: row.productType || null,
      imageUrl: row.imageUrl || null,
      description: row.description || null,
      features: row.features || "[]",
      supplementFlavor: row.supplementFlavor || null,
      supplementPresentation: row.supplementPresentation || null,
      supplementServings: row.supplementServings || null,
      apparelSize: row.apparelSize || null,
      apparelColor: row.apparelColor || null,
      apparelMaterial: row.apparelMaterial || null,
    }));

    const transaction = await sequelizeImporter.transaction();

    try {
      for (const row of rows) {
        await sequelizeImporter.query(
          `
          INSERT INTO staging.products_import (
            batch_id,
            row_num,
            id_producto,
            name,
            "brandId",
            "categoryId",
            price,
            stock,
            status,
            "productType",
            "imageUrl",
            description,
            features,
            "supplementFlavor",
            "supplementPresentation",
            "supplementServings",
            "apparelSize",
            "apparelColor",
            "apparelMaterial"
          )
          VALUES (
            :batch_id,
            :row_num,
            :id_producto,
            :name,
            :brandId,
            :categoryId,
            :price,
            :stock,
            :status,
            :productType,
            :imageUrl,
            :description,
            :features,
            :supplementFlavor,
            :supplementPresentation,
            :supplementServings,
            :apparelSize,
            :apparelColor,
            :apparelMaterial
          )
          `,
          {
            transaction,
            replacements: row,
          }
        );
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    return res.status(201).json({
      message: "Archivo cargado a staging correctamente",
      batchId,
      totalRows: rows.length,
    });
  } catch (error) {
    console.error("uploadProductsCsv error:", error);
    return res.status(500).json({
      error: "Error subiendo CSV",
      details: error.message,
    });
  }
};

/* =========================================================
   VALIDAR LOTE
========================================================= */
export const validateProductsImport = async (req, res) => {
  try {
    const { batchId } = req.params;

    await sequelizeImporter.query(
      `DELETE FROM staging.import_errors WHERE batch_id = :batchId`,
      { replacements: { batchId } }
    );

    // 1) NULOS OBLIGATORIOS
    await sequelizeImporter.query(`
      INSERT INTO staging.import_errors (batch_id, row_num, field_name, error_message)
      SELECT batch_id, row_num, 'name', 'Nombre obligatorio'
      FROM staging.products_import
      WHERE batch_id = '${batchId}'
        AND (name IS NULL OR btrim(name) = '');
    `);

    await sequelizeImporter.query(`
      INSERT INTO staging.import_errors (batch_id, row_num, field_name, error_message)
      SELECT batch_id, row_num, 'brandId', 'Marca obligatoria'
      FROM staging.products_import
      WHERE batch_id = '${batchId}'
        AND "brandId" IS NULL;
    `);

    await sequelizeImporter.query(`
      INSERT INTO staging.import_errors (batch_id, row_num, field_name, error_message)
      SELECT batch_id, row_num, 'categoryId', 'Categoría obligatoria'
      FROM staging.products_import
      WHERE batch_id = '${batchId}'
        AND "categoryId" IS NULL;
    `);

    await sequelizeImporter.query(`
      INSERT INTO staging.import_errors (batch_id, row_num, field_name, error_message)
      SELECT batch_id, row_num, 'price', 'Precio obligatorio'
      FROM staging.products_import
      WHERE batch_id = '${batchId}'
        AND price IS NULL;
    `);

    await sequelizeImporter.query(`
      INSERT INTO staging.import_errors (batch_id, row_num, field_name, error_message)
      SELECT batch_id, row_num, 'stock', 'Stock obligatorio'
      FROM staging.products_import
      WHERE batch_id = '${batchId}'
        AND stock IS NULL;
    `);

    await sequelizeImporter.query(`
      INSERT INTO staging.import_errors (batch_id, row_num, field_name, error_message)
      SELECT batch_id, row_num, 'productType', 'Tipo de producto obligatorio'
      FROM staging.products_import
      WHERE batch_id = '${batchId}'
        AND "productType" IS NULL;
    `);

    // 2) TIPOS / RANGOS
    await sequelizeImporter.query(`
      INSERT INTO staging.import_errors (batch_id, row_num, field_name, error_message)
      SELECT batch_id, row_num, 'price', 'Precio inválido'
      FROM staging.products_import
      WHERE batch_id = '${batchId}'
        AND price < 0;
    `);

    await sequelizeImporter.query(`
      INSERT INTO staging.import_errors (batch_id, row_num, field_name, error_message)
      SELECT batch_id, row_num, 'stock', 'Stock inválido'
      FROM staging.products_import
      WHERE batch_id = '${batchId}'
        AND stock < 0;
    `);

    await sequelizeImporter.query(`
      INSERT INTO staging.import_errors (batch_id, row_num, field_name, error_message)
      SELECT batch_id, row_num, 'status', 'Status inválido'
      FROM staging.products_import
      WHERE batch_id = '${batchId}'
        AND status IS NOT NULL
        AND status NOT IN ('Activo', 'Inactivo');
    `);

    await sequelizeImporter.query(`
      INSERT INTO staging.import_errors (batch_id, row_num, field_name, error_message)
      SELECT batch_id, row_num, 'productType', 'Tipo de producto inválido'
      FROM staging.products_import
      WHERE batch_id = '${batchId}'
        AND "productType" NOT IN ('Suplementación', 'Ropa');
    `);

    // 3) DUPLICADOS EN EL ARCHIVO
    await sequelizeImporter.query(`
      INSERT INTO staging.import_errors (batch_id, row_num, field_name, error_message)
      SELECT p.batch_id, p.row_num, 'id_producto', 'id_producto duplicado en el archivo'
      FROM staging.products_import p
      INNER JOIN (
        SELECT batch_id, id_producto
        FROM staging.products_import
        WHERE batch_id = '${batchId}' AND id_producto IS NOT NULL
        GROUP BY batch_id, id_producto
        HAVING COUNT(*) > 1
      ) d
      ON p.batch_id = d.batch_id
      AND p.id_producto = d.id_producto;
    `);

    // 4) FK VÁLIDAS
    await sequelizeImporter.query(`
      INSERT INTO staging.import_errors (batch_id, row_num, field_name, error_message)
      SELECT p.batch_id, p.row_num, 'brandId', 'Marca no existe'
      FROM staging.products_import p
      LEFT JOIN core."Brands" b
        ON p."brandId" = b.id_marca
      WHERE p.batch_id = '${batchId}'
        AND p."brandId" IS NOT NULL
        AND b.id_marca IS NULL;
    `);

    await sequelizeImporter.query(`
      INSERT INTO staging.import_errors (batch_id, row_num, field_name, error_message)
      SELECT p.batch_id, p.row_num, 'categoryId', 'Categoría no existe'
      FROM staging.products_import p
      LEFT JOIN core."Categories" c
        ON p."categoryId" = c.id_categoria
      WHERE p.batch_id = '${batchId}'
        AND p."categoryId" IS NOT NULL
        AND c.id_categoria IS NULL;
    `);

    const [errors] = await sequelizeImporter.query(`
      SELECT *
      FROM staging.import_errors
      WHERE batch_id = '${batchId}'
      ORDER BY row_num ASC, error_id ASC;
    `);

    const [[summary]] = await sequelizeImporter.query(`
      SELECT
        COUNT(*)::int AS total_rows
      FROM staging.products_import
      WHERE batch_id = '${batchId}';
    `);

    return res.json({
      batchId,
      totalRows: summary.total_rows,
      errorsCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error("validateProductsImport error:", error);
    return res.status(500).json({
      error: "Error validando importación",
      details: error.message,
    });
  }
};

/* =========================================================
   CONSULTAR ERRORES DEL LOTE
========================================================= */
export const getImportErrors = async (req, res) => {
  try {
    const { batchId } = req.params;

    const [errors] = await sequelizeImporter.query(`
      SELECT *
      FROM staging.import_errors
      WHERE batch_id = '${batchId}'
      ORDER BY row_num ASC, error_id ASC;
    `);

    return res.json({
      batchId,
      errorsCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error("getImportErrors error:", error);
    return res.status(500).json({
      error: "Error obteniendo errores",
      details: error.message,
    });
  }
};

/* =========================================================
   COMMIT FINAL A core.Products
   Aquí uso UPSERT por id_producto
========================================================= */
export const commitProductsImport = async (req, res) => {
  const transaction = await sequelizeImporter.transaction();

  try {
    const { batchId } = req.params;

    const [[errorsSummary]] = await sequelizeImporter.query(
      `
      SELECT COUNT(*)::int AS total_errors
      FROM staging.import_errors
      WHERE batch_id = :batchId
      `,
      {
        replacements: { batchId },
        transaction,
      }
    );

    if (errorsSummary.total_errors > 0) {
      await transaction.rollback();
      return res.status(400).json({
        error: "No se puede aplicar la importación porque existen errores",
        totalErrors: errorsSummary.total_errors,
      });
    }

    await sequelizeImporter.query(
      `
      INSERT INTO core."Products" (
        id_producto,
        name,
        "brandId",
        "categoryId",
        price,
        stock,
        status,
        "productType",
        "imageUrl",
        description,
        features,
        "supplementFlavor",
        "supplementPresentation",
        "supplementServings",
        "apparelSize",
        "apparelColor",
        "apparelMaterial",
        "createdAt",
        "updatedAt"
      )
      SELECT
        id_producto,
        name,
        "brandId",
        "categoryId",
        price,
        stock,
        COALESCE(status, 'Activo'),
        "productType",
        "imageUrl",
        description,
        COALESCE(features, '[]'),
        "supplementFlavor",
        "supplementPresentation",
        "supplementServings",
        "apparelSize",
        "apparelColor",
        "apparelMaterial",
        NOW(),
        NOW()
      FROM staging.products_import
      WHERE batch_id = :batchId
      ON CONFLICT (id_producto)
      DO UPDATE SET
        name = EXCLUDED.name,
        "brandId" = EXCLUDED."brandId",
        "categoryId" = EXCLUDED."categoryId",
        price = EXCLUDED.price,
        stock = EXCLUDED.stock,
        status = EXCLUDED.status,
        "productType" = EXCLUDED."productType",
        "imageUrl" = EXCLUDED."imageUrl",
        description = EXCLUDED.description,
        features = EXCLUDED.features,
        "supplementFlavor" = EXCLUDED."supplementFlavor",
        "supplementPresentation" = EXCLUDED."supplementPresentation",
        "supplementServings" = EXCLUDED."supplementServings",
        "apparelSize" = EXCLUDED."apparelSize",
        "apparelColor" = EXCLUDED."apparelColor",
        "apparelMaterial" = EXCLUDED."apparelMaterial",
        "updatedAt" = NOW();
      `,
      {
        replacements: { batchId },
        transaction,
      }
    );

    await transaction.commit();

    return res.json({
      ok: true,
      message: "Importación aplicada correctamente a core.Products",
      batchId,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("commitProductsImport error:", error);
    return res.status(500).json({
      error: "Error aplicando importación",
      details: error.message,
    });
  }
};