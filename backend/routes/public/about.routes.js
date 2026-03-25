import { Router } from "express";
import { getPublicAboutPage } from "../../controllers/publicAboutController.js";

const router = Router();

router.get("/", getPublicAboutPage);

export default router;