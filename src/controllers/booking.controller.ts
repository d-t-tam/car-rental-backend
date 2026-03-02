import { Response } from "express";
import { BuildRequest } from "../middlewares/auth.middleware";
import { BookingService } from "../services/booking.service";

export class BookingController {
    static async getPending(req: BuildRequest, res: Response) {
        try {
            const bookings = await BookingService.getPendingBookings();
            return res.status(200).json(bookings);
        } catch (error: any) {
            console.error("Get Pending Bookings Error:", error);
            return res.status(400).json({ message: error.message || "Failed to fetch pending bookings" });
        }
    }

    static async getReviewHistory(req: BuildRequest, res: Response) {
        try {
            const bookings = await BookingService.getReviewHistoryBookings();
            return res.status(200).json(bookings);
        } catch (error: any) {
            console.error("Get Review History Error:", error);
            return res.status(400).json({ message: error.message || "Failed to fetch review history" });
        }
    }

    static async create(req: BuildRequest, res: Response) {
        try {
            const { car_id, start_date, end_date } = req.body;
            const customer_id = req.user.userId;

            if (!car_id || !start_date || !end_date) {
                return res.status(400).json({ message: "car_id, start_date, and end_date are required" });
            }

            const booking = await BookingService.createBooking({
                customer_id,
                car_id: Number(car_id),
                start_date,
                end_date
            });

            return res.status(201).json({
                message: "Booking created successfully",
                booking
            });
        } catch (error: any) {
            console.error("Booking Error:", error);
            return res.status(400).json({ message: error.message || "Failed to create booking" });
        }
    }

    static async getBookedDates(req: BuildRequest, res: Response) {
        try {
            const { car_id } = req.params;

            if (!car_id) {
                return res.status(400).json({ message: "car_id is required" });
            }

            const bookedDates = await BookingService.getBookedDates(Number(car_id));

            return res.status(200).json(bookedDates);
        } catch (error: any) {
            console.error("Get Booked Dates Error:", error);
            return res.status(400).json({ message: error.message || "Failed to fetch booked dates" });
        }
    }

    static async getCustomerBookings(req: BuildRequest, res: Response) {
        try {
            const customer_id = req.user.userId;
            const bookings = await BookingService.getCustomerBookings(customer_id);

            return res.status(200).json(bookings);
        } catch (error: any) {
            console.error("Get Customer Bookings Error:", error);
            return res.status(400).json({ message: error.message || "Failed to fetch booking history" });
        }
    }


    static async cancel(req: BuildRequest, res: Response) {
        try {
            const { id } = req.params;
            const customer_id = req.user.userId;

            if (!id) {
                return res.status(400).json({ message: "Booking ID is required" });
            }

            const booking = await BookingService.cancelBooking(Number(id), customer_id);

            return res.status(200).json({
                message: "Booking cancelled successfully",
                booking
            });
        } catch (error: any) {
            console.error("Cancel Booking Error:", error);
            return res.status(400).json({ message: error.message || "Failed to cancel booking" });
        }
    }

    static async approve(req: BuildRequest, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: "Booking ID is required" });
            }

            const booking = await BookingService.approveBooking(Number(id));

            return res.status(200).json({
                message: "Booking approved successfully",
                booking
            });
        } catch (error: any) {
            console.error("Approve Booking Error:", error);
            return res.status(400).json({ message: error.message || "Failed to approve booking" });
        }
    }

    static async reject(req: BuildRequest, res: Response) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            if (!id) {
                return res.status(400).json({ message: "Booking ID is required" });
            }

            const booking = await BookingService.rejectBooking(Number(id), reason);

            return res.status(200).json({
                message: "Booking rejected successfully",
                booking
            });
        } catch (error: any) {
            console.error("Reject Booking Error:", error);
            return res.status(400).json({ message: error.message || "Failed to reject booking" });
        }
    }
}
