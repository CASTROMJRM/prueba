import { Router } from "express";
import {
  getPublicProductById,
  listPublicProducts,
} from "../../controllers/productController.js";

const router = Router();

router.get("/", listPublicProducts);
router.get("/:id", getPublicProductById);

export default router;
