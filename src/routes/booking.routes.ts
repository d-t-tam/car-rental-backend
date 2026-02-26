import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, BookingController.create);
router.get("/my-bookings", authenticate, BookingController.getCustomerBookings);
router.patch("/:id/cancel", authenticate, BookingController.cancel);
router.get("/car/:car_id/booked-dates", BookingController.getBookedDates);

export const bookingRoutes = router;
