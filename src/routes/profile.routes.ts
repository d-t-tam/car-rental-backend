import { ProfileController } from "@/controllers/profile.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.get("/profile", authenticate, ProfileController.getProfile);
router.put("/profile", authenticate, ProfileController.updateProfile);

export const profileRoutes = router;
