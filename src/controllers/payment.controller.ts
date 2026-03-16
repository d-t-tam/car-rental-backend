import { Response } from "express";
import { BuildRequest } from "../middlewares/auth.middleware";
import { PaymentService } from "../services/payment.service";
import { prisma } from "../configs/prisma";

export class PaymentController {
    /**
     * Process payment for a booking
     */
    static async createPayment(req: BuildRequest, res: Response) {
        try {
            const { booking_id, amount, payment_method, notes } = req.body;
            const customer_id = req.user.userId;

            if (!booking_id || !amount || !payment_method) {
                return res.status(400).json({
                    message: "booking_id, amount, and payment_method are required"
                });
            }

            // Verify that the booking belongs to the customer
            const booking = await prisma.booking.findUnique({
                where: { booking_id: Number(booking_id) },
                include: { customer: true }
            });

            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            if (booking.customer_id !== customer_id) {
                return res.status(403).json({ message: "You can only pay for your own bookings" });
            }

            const payment = await PaymentService.processPayment({
                booking_id: Number(booking_id),
                amount: Number(amount),
                payment_method,
                notes
            });

            return res.status(201).json({
                message: "Payment processed successfully",
                payment
            });
        } catch (error: any) {
            console.error("Payment Error:", error);
            return res.status(400).json({
                message: error.message || "Failed to process payment"
            });
        }
    }

    /**
     * Get payment history for a booking
     */
    static async getPaymentHistory(req: BuildRequest, res: Response) {
        try {
            const { booking_id } = req.params;
            const customer_id = req.user.userId;

            if (!booking_id) {
                return res.status(400).json({ message: "booking_id is required" });
            }

            // Verify booking ownership
            const booking = await prisma.booking.findUnique({
                where: { booking_id: Number(booking_id) }
            });

            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            if (booking.customer_id !== customer_id) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const history = await PaymentService.getPaymentHistory(Number(booking_id));

            return res.status(200).json(history);
        } catch (error: any) {
            console.error("Get Payment History Error:", error);
            return res.status(400).json({
                message: error.message || "Failed to fetch payment history"
            });
        }
    }

    /**
     * Get payment summary for a booking
     */
    static async getPaymentSummary(req: BuildRequest, res: Response) {
        try {
            const { booking_id } = req.params;
            const customer_id = req.user.userId;

            if (!booking_id) {
                return res.status(400).json({ message: "booking_id is required" });
            }

            // Verify booking ownership
            const booking = await prisma.booking.findUnique({
                where: { booking_id: Number(booking_id) }
            });

            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            if (booking.customer_id !== customer_id) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const summary = await PaymentService.getPaymentSummary(Number(booking_id));

            return res.status(200).json(summary);
        } catch (error: any) {
            console.error("Get Payment Summary Error:", error);
            return res.status(400).json({
                message: error.message || "Failed to fetch payment summary"
            });
        }
    }

    /**
     * Get all payments for current customer
     */
    static async getCustomerPayments(req: BuildRequest, res: Response) {
        try {
            const customer_id = req.user.userId;

            const payments = await PaymentService.getCustomerPayments(customer_id);

            return res.status(200).json(payments);
        } catch (error: any) {
            console.error("Get Customer Payments Error:", error);
            return res.status(400).json({
                message: error.message || "Failed to fetch payments"
            });
        }
    }

    /**
     * Process refund (admin only, but we'll allow customer to see status)
     */
    static async processRefund(req: BuildRequest, res: Response) {
        try {
            const { booking_id } = req.params;
            const { amount, reason } = req.body;
            const customer_id = req.user.userId;

            if (!booking_id || !amount) {
                return res.status(400).json({
                    message: "booking_id and amount are required"
                });
            }

            // Verify booking ownership
            const booking = await prisma.booking.findUnique({
                where: { booking_id: Number(booking_id) }
            });

            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            if (booking.customer_id !== customer_id) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const refund = await PaymentService.processRefund(
                Number(booking_id),
                Number(amount),
                reason
            );

            return res.status(201).json({
                message: "Refund processed successfully",
                refund
            });
        } catch (error: any) {
            console.error("Refund Error:", error);
            return res.status(400).json({
                message: error.message || "Failed to process refund"
            });
        }
    }
}
