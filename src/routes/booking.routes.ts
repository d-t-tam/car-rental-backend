import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, BookingController.create);

export const bookingRoutes = router;
