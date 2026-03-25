import { Router } from "express";
import { listPublicCatalogProducts } from "../../controllers/publicCatalogController.js";

const router = Router();

router.get("/products", listPublicCatalogProducts);

export default router;