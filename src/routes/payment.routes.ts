import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const paymentRoutes = Router();

// All payment routes require authentication
paymentRoutes.use(authenticate);

// Create a payment
paymentRoutes.post("/", PaymentController.createPayment);

// Get payment history for a booking
paymentRoutes.get("/booking/:booking_id/history", PaymentController.getPaymentHistory);

// Get payment summary for a booking
paymentRoutes.get("/booking/:booking_id/summary", PaymentController.getPaymentSummary);

// Get all payments for current customer
paymentRoutes.get("/customer/all", PaymentController.getCustomerPayments);

// Process refund for a booking
paymentRoutes.post("/booking/:booking_id/refund", PaymentController.processRefund);

export { paymentRoutes };
