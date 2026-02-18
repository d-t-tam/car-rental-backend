import { prisma } from "../configs/prisma";
import { BookingStatus, PaymentStatus, CarStatus } from "../generated/prisma";
import { Prisma } from "../generated/prisma";

export class BookingService {
    static async createBooking(data: {
        customer_id: number;
        car_id: number;
        start_date: string;
        end_date: string;
    }) {
        const { customer_id, car_id, start_date, end_date } = data;
        const start = new Date(start_date);
        const end = new Date(end_date);

        if (start >= end) {
            throw new Error("Start date must be before end date");
        }

        // 1. Check if car exists and is not disabled
        const car = await prisma.car.findUnique({
            where: { car_id },
            include: { category: true }
        });

        if (!car) {
            throw new Error("Car not found");
        }

        if (car.status === CarStatus.Disabled) {
            throw new Error("This car is currently disabled and cannot be booked");
        }

        // 2. Check for overlapping bookings
        const overlaps = await prisma.booking.findMany({
            where: {
                car_id,
                status: {
                    in: [BookingStatus.Pending, BookingStatus.Confirmed, BookingStatus.Active, BookingStatus.Deposit_Paid]
                },
                AND: [
                    { start_date: { lt: end } },
                    { end_date: { gt: start } }
                ]
            }
        });

        if (overlaps.length > 0) {
            throw new Error("The car is already booked for the selected timeframe");
        }

        // 3. Calculate price
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalPrice = new Prisma.Decimal(car.rental_price_per_day).mul(diffDays);

        // 4. Create booking
        return await prisma.booking.create({
            data: {
                customer_id,
                car_id,
                start_date: start,
                end_date: end,
                total_price: totalPrice,
                total_paid: 0,
                status: BookingStatus.Pending,
                payment_status: PaymentStatus.Unpaid
            },
            include: {
                car: true,
                customer: true
            }
        });
    }
}
