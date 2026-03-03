import { prisma } from "../configs/prisma";
import { BookingStatus, PaymentStatus, CarStatus, InspectionType, ItemStatus } from "../generated/prisma";
import { Prisma } from "../generated/prisma";

type InspectionItemInput = {
    item_name: string;
    status: ItemStatus;
    notes?: string;
    photo_url?: string;
};

export class BookingService {
    static async getHandoverReadyBookings() {
        return await prisma.booking.findMany({
            where: {
                status: {
                    in: [BookingStatus.Confirmed, BookingStatus.Deposit_Paid],
                },
            },
            include: {
                car: {
                    include: {
                        category: true,
                        images: {
                            where: {
                                is_thumbnail: true,
                            },
                            take: 1,
                        },
                    },
                },
                customer: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                username: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updated_at: "asc",
            },
        });
    }

    static async getReturnReadyBookings() {
        return await prisma.booking.findMany({
            where: {
                status: BookingStatus.Active,
            },
            include: {
                car: {
                    include: {
                        category: true,
                        images: {
                            where: {
                                is_thumbnail: true,
                            },
                            take: 1,
                        },
                    },
                },
                customer: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                username: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updated_at: "asc",
            },
        });
    }

    static async getPendingBookings() {
        return await prisma.booking.findMany({
            where: {
                status: BookingStatus.Pending,
            },
            include: {
                car: {
                    include: {
                        category: true,
                        images: {
                            where: {
                                is_thumbnail: true,
                            },
                            take: 1,
                        },
                    },
                },
                customer: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                username: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: "asc",
            },
        });
    }

    static async getReviewHistoryBookings() {
        return await prisma.booking.findMany({
            where: {
                status: {
                    in: [BookingStatus.Confirmed, BookingStatus.Cancelled],
                },
            },
            include: {
                car: {
                    include: {
                        category: true,
                        images: {
                            where: {
                                is_thumbnail: true,
                            },
                            take: 1,
                        },
                    },
                },
                customer: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                username: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updated_at: "desc",
            },
        });
    }

    static async createBooking(data: {
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
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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

    static async getBookedDates(car_id: number) {
        return await prisma.booking.findMany({
            where: {
                car_id,
                status: {
                    in: [
                        BookingStatus.Pending,
                        BookingStatus.Confirmed,
                        BookingStatus.Active,
                        BookingStatus.Deposit_Paid
                    ]
                }
            },
            select: {
                start_date: true,
                end_date: true
            },
            orderBy: {
                start_date: 'asc'
            }
        });
    }

    static async getCustomerBookings(customer_id: number) {
        return await prisma.booking.findMany({
            where: {
                customer_id
            },
            include: {
                car: {
                    include: {
                        images: {
                            where: {
                                is_thumbnail: true
                            }
                        },
                        category: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }

    static async cancelBooking(booking_id: number, customer_id: number) {
        const booking = await prisma.booking.findUnique({
            where: { booking_id }
        });

        if (!booking) {
            throw new Error("Booking not found");
        }

        if (booking.customer_id !== customer_id) {
            throw new Error("You are not authorized to cancel this booking");
        }

        const allowableStatuses: BookingStatus[] = [
            BookingStatus.Pending,
            BookingStatus.Confirmed,
            BookingStatus.Deposit_Paid
        ];

        if (!allowableStatuses.includes(booking.status)) {
            throw new Error(`Cannot cancel booking with status: ${booking.status}`);
        }

        return await prisma.booking.update({
            where: { booking_id },
            data: {
                status: BookingStatus.Cancelled
            }
        });
    }

    static async approveBooking(booking_id: number) {
        const booking = await prisma.booking.findUnique({
            where: { booking_id }
        });

        if (!booking) {
            throw new Error("Booking not found");
        }

        if (booking.status !== BookingStatus.Pending) {
            throw new Error(`Only pending bookings can be approved. Current status: ${booking.status}`);
        }

        return await prisma.booking.update({
            where: { booking_id },
            data: {
                status: BookingStatus.Confirmed
            }
        });
    }

    static async rejectBooking(booking_id: number, reason?: string) {
        const booking = await prisma.booking.findUnique({
            where: { booking_id }
        });

        if (!booking) {
            throw new Error("Booking not found");
        }

        if (booking.status !== BookingStatus.Pending) {
            throw new Error(`Only pending bookings can be rejected. Current status: ${booking.status}`);
        }

        return await prisma.booking.update({
            where: { booking_id },
            data: {
                status: BookingStatus.Cancelled
            }
        });
    }

    static async autoCancelNoShowBookings(graceHours: number) {
        const hours = Number.isFinite(graceHours) && graceHours >= 0 ? graceHours : 0;
        const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);

        const result = await prisma.booking.updateMany({
            where: {
                status: {
                    in: [BookingStatus.Confirmed, BookingStatus.Deposit_Paid],
                },
                start_date: {
                    lte: threshold,
                },
            },
            data: {
                status: BookingStatus.Cancelled,
            },
        });

        return {
            cancelledCount: result.count,
            threshold,
        };
    }

    static async handoverCar(
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

    static async receiveReturnedCar(
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

    private static async createInspection(input: {
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

        const staffProfile = await prisma.staffProfile.findUnique({
            where: { user_id: staff_user_id },
        });

        if (!staffProfile) {
            throw new Error("Staff profile not found");
        }

        const booking = await prisma.booking.findUnique({
            where: { booking_id },
        });

        if (!booking) {
            throw new Error("Booking not found");
        }

        if (!expectedBookingStatus.includes(booking.status)) {
            throw new Error(`Booking status must be one of: ${expectedBookingStatus.join(", ")}`);
        }

        const existingInspection = await prisma.bookingInspection.findFirst({
            where: {
                booking_id,
                type,
            },
        });

        if (existingInspection) {
            throw new Error(`${type} inspection already exists for this booking`);
        }

        return await prisma.$transaction(async (tx) => {
            const inspection = await tx.bookingInspection.create({
                data: {
                    booking_id,
                    staff_id: staffProfile.user_id,
                    type,
                    odometer_reading,
                    fuel_level,
                    condition_summary: condition_summary ?? null,
                    customer_signature_url: customer_signature_url ?? null,
                    items: {
                        create: items.map((item) => ({
                            item_name: item.item_name,
                            status: item.status,
                            notes: item.notes ?? null,
                            photo_url: item.photo_url ?? null,
                        })),
                    },
                },
                include: {
                    items: true,
                    staff: {
                        include: {
                            user: {
                                select: {
                                    user_id: true,
                                    username: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });

            await tx.booking.update({
                where: { booking_id },
                data: {
                    status: nextBookingStatus,
                },
            });

            await tx.car.update({
                where: { car_id: booking.car_id },
                data: {
                    status: nextCarStatus,
                },
            });

            return inspection;
        });
    }
}
