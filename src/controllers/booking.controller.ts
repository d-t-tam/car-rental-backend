import { Response } from "express";
import { BuildRequest } from "../middlewares/auth.middleware";
import { BookingService } from "../services/booking.service";

export class BookingController {
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
}
