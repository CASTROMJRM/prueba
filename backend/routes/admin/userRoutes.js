import express from "express";
import { verifyToken, authorizeRole } from "../../middleware/authMiddleware.js";
import { adminRegisterTrainer } from "../../controllers/authController.js";
import { checkBlacklist } from "../../middleware/checkBlacklist.js";

const router = express.Router();

// Solo administradores pueden registrar entrenadores
router.post("/register-trainer", verifyToken, checkBlacklist, authorizeRole("administrador"), adminRegisterTrainer);

export default router;