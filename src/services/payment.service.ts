import { Decimal } from "@/generated/prisma/runtime/client";
import { prisma } from "../configs/prisma";
import { PaymentMethod, TransactionType, TransactionStatus, PaymentStatus } from "../generated/prisma";

interface CreatePaymentData {
    booking_id: number;
    amount: number;
    payment_method: PaymentMethod;
    notes?: string;
}

interface PaymentResponse {
    transaction_id: number;
    booking_id: number;
    amount: Decimal;
    payment_method: PaymentMethod;
    status: TransactionStatus;
    transaction_date: string;
}

export class PaymentService {
    /**
     * Process a payment for a booking
     */
    static async processPayment(data: CreatePaymentData): Promise<PaymentResponse> {
        const { booking_id, amount, payment_method, notes } = data;

        // 1. Verify booking exists
        const booking = await prisma.booking.findUnique({
            where: { booking_id },
            include: { customer: true }
        });

        if (!booking) {
            throw new Error("Booking not found");
        }

        if (amount <= 0) {
            throw new Error("Payment amount must be greater than 0");
        }

        if (amount > Number(booking.total_price)) {
            throw new Error(`Payment amount cannot exceed total price of $${booking.total_price}`);
        }

        // 2. Create transaction record
        const transaction = await prisma.transaction.create({
            data: {
                booking_id,
                amount: new Decimal(amount.toString()),
                type: TransactionType.Payment,
                payment_method,
                status: TransactionStatus.Success,
                notes: notes ?? null,
                gateway_txn_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
        });

        // 3. Update booking's total_paid and payment_status
        const newTotalPaid = Number(booking.total_paid) + amount;
        let newPaymentStatus: PaymentStatus;

        if (newTotalPaid >= Number(booking.total_price)) {
            newPaymentStatus = PaymentStatus.Paid;
        } else {
            newPaymentStatus = PaymentStatus.Partially_Paid;
        }

        await prisma.booking.update({
            where: { booking_id },
            data: {
                total_paid: newTotalPaid.toString(),
                payment_status: newPaymentStatus
            }
        });

        // 4. Update customer wallet balance if payment method is Wallet
        if (payment_method === "Wallet") {
            await prisma.customerProfile.update({
                where: { user_id: booking.customer_id },
                data: {
                    wallet_balance: {
                        decrement: amount
                    }
                }
            });
        }

        return {
            transaction_id: transaction.transaction_id,
            booking_id: transaction.booking_id,
            amount: transaction.amount,
            payment_method: transaction.payment_method,
            status: transaction.status,
            transaction_date: transaction.transaction_date.toISOString()
        };
    }

    /**
     * Get payment history for a booking
     */
    static async getPaymentHistory(booking_id: number) {
        const transactions = await prisma.transaction.findMany({
            where: { booking_id },
            orderBy: { transaction_date: 'desc' }
        });

        return transactions;
    }

    /**
     * Get all payments made by a customer
     */
    static async getCustomerPayments(customer_id: number) {
        const transactions = await prisma.transaction.findMany({
            where: {
                booking: {
                    customer_id
                }
            },
            include: {
                booking: {
                    include: {
                        car: {
                            select: {
                                name: true,
                                license_plate: true
                            }
                        }
                    }
                }
            },
            orderBy: { transaction_date: 'desc' }
        });

        return transactions;
    }

    /**
     * Process refund for a booking
     */
    static async processRefund(booking_id: number, amount: number, reason?: string) {
        const booking = await prisma.booking.findUnique({
            where: { booking_id },
            include: { customer: true }
        });

        if (!booking) {
            throw new Error("Booking not found");
        }

        if (amount <= 0 || amount > Number(booking.total_paid)) {
            throw new Error("Invalid refund amount");
        }

        // Create refund transaction
        const refundTransaction = await prisma.transaction.create({
            data: {
                booking_id,
                amount: new Decimal(amount.toString()),
                type: TransactionType.Refund,
                payment_method: "Wallet", // Refunds go to wallet
                status: TransactionStatus.Success,
                notes: reason || "Refund processed",
                gateway_txn_id: `REFUND_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
        });

        // Update booking total_paid
        const newTotalPaid = Number(booking.total_paid) - amount;
        const newPaymentStatus = newTotalPaid === 0 ? PaymentStatus.Unpaid : PaymentStatus.Partially_Paid;

        await prisma.booking.update({
            where: { booking_id },
            data: {
                total_paid: newTotalPaid.toString(),
                payment_status: newPaymentStatus
            }
        });

        // Add refund to customer wallet
        await prisma.customerProfile.update({
            where: { user_id: booking.customer_id },
            data: {
                wallet_balance: {
                    increment: amount
                }
            }
        });

        return refundTransaction;
    }

    /**
     * Get booking payment summary
     */
    static async getPaymentSummary(booking_id: number) {
        const booking = await prisma.booking.findUnique({
            where: { booking_id },
            select: {
                booking_id: true,
                total_price: true,
                total_paid: true,
                payment_status: true,
                transactions: {
                    orderBy: { transaction_date: 'desc' }
                }
            }
        });

        if (!booking) {
            throw new Error("Booking not found");
        }

        const remaining = Number(booking.total_price) - Number(booking.total_paid);

        return {
            booking_id: booking.booking_id,
            total_price: booking.total_price,
            total_paid: booking.total_paid,
            remaining_amount: remaining > 0 ? remaining : 0,
            payment_status: booking.payment_status,
            transaction_count: booking.transactions.length,
            last_payment: booking.transactions[0] || null
        };
    }
}
