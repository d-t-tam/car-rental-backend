import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../generated/prisma/client";

const router = Router();

router.post("/", authenticate, BookingController.create);
router.get("/my-bookings", authenticate, BookingController.getCustomerBookings);
router.patch("/:id/cancel", authenticate, BookingController.cancel);
router.get("/car/:car_id/booked-dates", BookingController.getBookedDates);

// Staff / Admin Only
router.get("/pending", authenticate, authorize(UserRole.Staff, UserRole.Admin), BookingController.getPending);
router.get("/review-history", authenticate, authorize(UserRole.Staff, UserRole.Admin), BookingController.getReviewHistory);
router.patch("/:id/approve", authenticate, authorize(UserRole.Staff, UserRole.Admin), BookingController.approve);
router.patch("/:id/reject", authenticate, authorize(UserRole.Staff, UserRole.Admin), BookingController.reject);

export const bookingRoutes = router;
