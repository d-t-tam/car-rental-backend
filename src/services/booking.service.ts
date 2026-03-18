import { prisma } from "../configs/prisma";
import { BookingRepository, InspectionItemInput } from "../repository/booking.repository";
import { CarRepository } from "../repository/car.repository";
import { UserRepository } from "../repository/user.repository";
import { BookingStatus, CarStatus, InspectionType } from "../generated/prisma";
import { Prisma } from "../generated/prisma";
import { NotFoundError } from "../repository/errors";

export class BookingService {
    private bookingRepo: BookingRepository;
    private carRepo: CarRepository;
    private userRepo: UserRepository;

    constructor() {
        this.bookingRepo = new BookingRepository(prisma);
        this.carRepo = new CarRepository(prisma);
        this.userRepo = new UserRepository(prisma);
    }

    async getHandoverReadyBookings() {
        return this.bookingRepo.findHandoverReady();
    }

    async getReturnReadyBookings() {
        return this.bookingRepo.findReturnReady();
    }

    async getPendingBookings() {
        return this.bookingRepo.findPending();
    }

    async getReviewHistoryBookings() {
        return this.bookingRepo.findReviewHistory();
    }

    async createBooking(data: {
        customer_id: number;
        car_id: number;
        start_date: string;
        end_date: string;
    }) {
        const { customer_id, car_id, start_date, end_date } = data;
        const start = new Date(start_date);
        const end = new Date(end_date);

        if (start > end) {
            throw new Error("Start date must be before or equal to end date");
        }

        const car = await this.carRepo.findByIdWithCategory(car_id);
        if (!car) {
            throw new Error("Car not found");
        }

        if (car.status === CarStatus.Disabled) {
            throw new Error("This car is currently disabled and cannot be booked");
        }

        const overlaps = await this.bookingRepo.findOverlapping(car_id, start, end);
        if (overlaps.length > 0) {
            throw new Error("The car is already booked for the selected timeframe");
        }

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const totalPrice = new Prisma.Decimal(car.rental_price_per_day).mul(diffDays);

        return this.bookingRepo.create({
            customer_id,
            car_id,
            start_date: start,
            end_date: end,
            total_price: totalPrice,
        });
    }

    async getBookedDates(car_id: number) {
        return this.bookingRepo.getBookedDateRanges(car_id);
    }

    async getCustomerBookings(customer_id: number) {
        return this.bookingRepo.findByCustomerId(customer_id);
    }

    async cancelBooking(booking_id: number, customer_id: number) {
        const booking = await this.bookingRepo.findById(booking_id);

        if (!booking) {
            throw new NotFoundError("Booking", booking_id);
        }

        if (booking.customer_id !== customer_id) {
            throw new Error("You are not authorized to cancel this booking");
        }

        const allowableStatuses: BookingStatus[] = [
            BookingStatus.Pending,
            BookingStatus.Confirmed,
            BookingStatus.Deposit_Paid,
        ];

        if (!allowableStatuses.includes(booking.status)) {
            throw new Error(`Cannot cancel booking with status: ${booking.status}`);
        }

        return this.bookingRepo.updateStatus(booking_id, BookingStatus.Cancelled);
    }

    async approveBooking(booking_id: number) {
        const booking = await this.bookingRepo.findById(booking_id);

        if (!booking) {
            throw new NotFoundError("Booking", booking_id);
        }

        if (booking.status !== BookingStatus.Pending) {
            throw new Error(`Only pending bookings can be approved. Current status: ${booking.status}`);
        }

        return this.bookingRepo.updateStatus(booking_id, BookingStatus.Confirmed);
    }

    async rejectBooking(booking_id: number) {
        const booking = await this.bookingRepo.findById(booking_id);

        if (!booking) {
            throw new NotFoundError("Booking", booking_id);
        }

        if (booking.status !== BookingStatus.Pending) {
            throw new Error(`Only pending bookings can be approved. Current status: ${booking.status}`);
        }

        return this.bookingRepo.updateStatus(booking_id, BookingStatus.Cancelled);
    }

    async autoCancelNoShowBookings(graceHours: number) {
        const result = await this.bookingRepo.cancelNoShowBookings(graceHours);
        const hours = Number.isFinite(graceHours) && graceHours >= 0 ? graceHours : 0;
        const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);

        return {
            cancelledCount: result.count,
            threshold,
        };
    }

    async handoverCar(
        booking_id: number,
        staff_user_id: number,
        data: {
            odometer_reading: number;
            fuel_level: number;
            condition_summary?: string;
            customer_signature_url?: string;
            items?: InspectionItemInput[];
        }
    ) {
        return this.createInspection({
            booking_id,
            staff_user_id,
            type: InspectionType.Handover,
            expectedBookingStatus: [BookingStatus.Confirmed, BookingStatus.Deposit_Paid],
            nextBookingStatus: BookingStatus.Active,
            nextCarStatus: CarStatus.Rented,
            ...data,
        });
    }

    async receiveReturnedCar(
        booking_id: number,
        staff_user_id: number,
        data: {
            odometer_reading: number;
            fuel_level: number;
            condition_summary?: string;
            customer_signature_url?: string;
            items?: InspectionItemInput[];
        }
    ) {
        return this.createInspection({
            booking_id,
            staff_user_id,
            type: InspectionType.Return,
            expectedBookingStatus: [BookingStatus.Active],
            nextBookingStatus: BookingStatus.Completed,
            nextCarStatus: CarStatus.Available,
            ...data,
        });
    }

    private async createInspection(input: {
        booking_id: number;
        staff_user_id: number;
        type: InspectionType;
        expectedBookingStatus: BookingStatus[];
        nextBookingStatus: BookingStatus;
        nextCarStatus: CarStatus;
        odometer_reading: number;
        fuel_level: number;
        condition_summary?: string;
        customer_signature_url?: string;
        items?: InspectionItemInput[];
    }) {
        const {
            booking_id,
            staff_user_id,
            type,
            expectedBookingStatus,
            nextBookingStatus,
            nextCarStatus,
            odometer_reading,
            fuel_level,
            condition_summary,
            customer_signature_url,
            items = [],
        } = input;

        if (fuel_level < 0 || fuel_level > 100) {
            throw new Error("fuel_level must be between 0 and 100");
        }

        const staffProfile = await this.userRepo.findStaffProfile(staff_user_id);
        if (!staffProfile) {
            throw new Error("Staff profile not found");
        }

        const booking = await this.bookingRepo.findById(booking_id);
        if (!booking) {
            throw new NotFoundError("Booking", booking_id);
        }

        if (!expectedBookingStatus.includes(booking.status)) {
            throw new Error(`Booking status must be one of: ${expectedBookingStatus.join(", ")}`);
        }

        const existingInspection = await this.bookingRepo.findExistingInspection(booking_id, type);
        if (existingInspection) {
            throw new Error(`${type} inspection already exists for this booking`);
        }

        const staffProfileData = staffProfile as { user_id: number };
        const inspectionData = {
            odometer_reading,
            fuel_level,
            ...(condition_summary !== undefined ? { condition_summary } : {}),
            ...(customer_signature_url !== undefined ? { customer_signature_url } : {}),
            items,
        };
        const inspection = await this.bookingRepo.createInspection(
            booking_id,
            staffProfileData.user_id,
            type,
            inspectionData
        );

        await this.bookingRepo.updateStatus(booking_id, nextBookingStatus);
        await this.carRepo.updateStatus(booking.car_id, nextCarStatus);

        return inspection;
    }
}
