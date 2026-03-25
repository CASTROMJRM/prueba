import { Router } from "express";
import multer from "multer";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import {
  getAdminAboutPage,
  updateAdminAboutPage,
} from "../../controllers/adminAboutController.js";
import {
  createAboutValue,
  updateAboutValue,
  deleteAboutValue,
  reorderAboutValues,
} from "../../controllers/adminAboutValueController.js";
import {
  createAboutTeamMember,
  updateAboutTeamMember,
  deleteAboutTeamMember,
  reorderAboutTeamMembers,
} from "../../controllers/adminAboutTeamController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth, requireAdmin);

router.get("/", getAdminAboutPage);

router.put(
  "/",
  upload.fields([
    { name: "heroImage", maxCount: 1 },
    { name: "introImage", maxCount: 1 },
    { name: "missionImage", maxCount: 1 },
    { name: "visionImage", maxCount: 1 },
    { name: "valuesImage", maxCount: 1 },
  ]),
  updateAdminAboutPage,
);

// values
router.post("/values", createAboutValue);
router.put("/values/:id", updateAboutValue);
router.delete("/values/:id", deleteAboutValue);
router.put("/values/reorder", reorderAboutValues);

// team
router.post("/team", upload.single("image"), createAboutTeamMember);
router.put("/team/:id", upload.single("image"), updateAboutTeamMember);
router.delete("/team/:id", deleteAboutTeamMember);
router.put("/team/reorder", reorderAboutTeamMembers);

export default router;
