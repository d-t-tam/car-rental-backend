import { Prisma, PrismaClient, Booking, BookingStatus, BookingInspection, InspectionType, ItemStatus } from "../generated/prisma";
import { NotFoundError } from "./errors";

export type BookingWithRelations = Booking & {
    car: {
        category: unknown;
        images: unknown[];
    };
    customer: {
        user: {
            email: string;
            username: string;
            phone: string | null;
        };
    };
};

export type InspectionItemInput = {
    item_name: string;
    status: ItemStatus;
    notes?: string;
    photo_url?: string;
};

export class BookingRepository {
    constructor(private prisma: PrismaClient) {}

    async findById(booking_id: number): Promise<Booking | null> {
        return this.prisma.booking.findUnique({
            where: { booking_id },
            include: {
                car: {
                    include: {
                        category: true,
                        images: true,
                    },
                },
                customer: true,
                inspections: true,
                transactions: true,
                feedback: true,
            },
        });
    }

    async findHandoverReady(): Promise<BookingWithRelations[]> {
        return this.prisma.booking.findMany({
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
                            where: { is_thumbnail: true },
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
            orderBy: { updated_at: "asc" },
        }) as Promise<BookingWithRelations[]>;
    }

    async findReturnReady(): Promise<BookingWithRelations[]> {
        return this.prisma.booking.findMany({
            where: { status: BookingStatus.Active },
            include: {
                car: {
                    include: {
                        category: true,
                        images: {
                            where: { is_thumbnail: true },
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
            orderBy: { updated_at: "asc" },
        }) as Promise<BookingWithRelations[]>;
    }

    async findPending(): Promise<BookingWithRelations[]> {
        return this.prisma.booking.findMany({
            where: { status: BookingStatus.Pending },
            include: {
                car: {
                    include: {
                        category: true,
                        images: {
                            where: { is_thumbnail: true },
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
            orderBy: { created_at: "asc" },
        }) as Promise<BookingWithRelations[]>;
    }

    async findReviewHistory(): Promise<BookingWithRelations[]> {
        return this.prisma.booking.findMany({
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
                            where: { is_thumbnail: true },
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
            orderBy: { updated_at: "desc" },
        }) as Promise<BookingWithRelations[]>;
    }

    async findByCustomerId(customer_id: number): Promise<Booking[]> {
        return this.prisma.booking.findMany({
            where: { customer_id },
            include: {
                car: {
                    include: {
                        images: { where: { is_thumbnail: true } },
                        category: true,
                    },
                },
            },
            orderBy: { created_at: "desc" },
        });
    }

    async findOverlapping(
        car_id: number,
        startDate: Date,
        endDate: Date
    ): Promise<Booking[]> {
        return this.prisma.booking.findMany({
            where: {
                car_id,
                status: {
                    in: [
                        BookingStatus.Pending,
                        BookingStatus.Confirmed,
                        BookingStatus.Active,
                        BookingStatus.Deposit_Paid,
                    ],
                },
                AND: [
                    { start_date: { lt: endDate } },
                    { end_date: { gt: startDate } },
                ],
            },
        });
    }

    async getBookedDateRanges(car_id: number): Promise<{ start_date: Date; end_date: Date }[]> {
        return this.prisma.booking.findMany({
            where: {
                car_id,
                status: {
                    in: [
                        BookingStatus.Pending,
                        BookingStatus.Confirmed,
                        BookingStatus.Active,
                        BookingStatus.Deposit_Paid,
                    ],
                },
            },
            select: { start_date: true, end_date: true },
            orderBy: { start_date: "asc" },
        });
    }

    async create(data: {
        customer_id: number;
        car_id: number;
        start_date: Date;
        end_date: Date;
        total_price: Prisma.Decimal;
    }): Promise<Booking> {
        return this.prisma.booking.create({
            data: {
                customer_id: data.customer_id,
                car_id: data.car_id,
                start_date: data.start_date,
                end_date: data.end_date,
                total_price: data.total_price,
                total_paid: 0,
                status: BookingStatus.Pending,
                payment_status: "Unpaid" as const,
            },
            include: {
                car: true,
                customer: true,
            },
        });
    }

    async createWithLock(data: {
        customer_id: number;
        car_id: number;
        start_date: Date;
        end_date: Date;
        total_price: Prisma.Decimal;
    }): Promise<Booking> {
        return this.prisma.$transaction(async (tx) => {
            // Lock the car row to prevent concurrent bookings
            // The FOR UPDATE clause ensures that any other concurrent transaction
            // trying to lock this same car row will wait until this one finishes.
            await tx.$queryRaw`SELECT 1 FROM cars WHERE car_id = ${data.car_id} FOR UPDATE`;

            // Now check for overlaps safely inside the lock
            const overlaps = await tx.booking.findMany({
                where: {
                    car_id: data.car_id,
                    status: {
                        in: [
                            BookingStatus.Pending,
                            BookingStatus.Confirmed,
                            BookingStatus.Active,
                            BookingStatus.Deposit_Paid,
                        ],
                    },
                    AND: [
                        { start_date: { lt: data.end_date } },
                        { end_date: { gt: data.start_date } },
                    ],
                },
            });

            if (overlaps.length > 0) {
                throw new Error("The car is already booked for the selected timeframe");
            }

            return tx.booking.create({
                data: {
                    customer_id: data.customer_id,
                    car_id: data.car_id,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    total_price: data.total_price,
                    total_paid: 0,
                    status: BookingStatus.Pending,
                    payment_status: "Unpaid" as const,
                },
                include: {
                    car: true,
                    customer: true,
                },
            });
        });
    }

    async updateStatus(booking_id: number, status: BookingStatus): Promise<Booking> {
        return this.prisma.booking.update({
            where: { booking_id },
            data: { status },
        });
    }

    async cancelNoShowBookings(graceHours: number): Promise<{ count: number }> {
        const hours = Number.isFinite(graceHours) && graceHours >= 0 ? graceHours : 0;
        const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);

        const result = await this.prisma.booking.updateMany({
            where: {
                status: {
                    in: [BookingStatus.Confirmed, BookingStatus.Deposit_Paid],
                },
                start_date: { lte: threshold },
            },
            data: { status: BookingStatus.Cancelled },
        });

        return { count: result.count };
    }

    async createInspection(
        booking_id: number,
        staff_id: number,
        type: InspectionType,
        data: {
            odometer_reading: number;
            fuel_level: number;
            condition_summary?: string;
            customer_signature_url?: string;
            items?: InspectionItemInput[];
        }
    ): Promise<BookingInspection> {
        const { odometer_reading, fuel_level, condition_summary, customer_signature_url, items = [] } = data;

        return this.prisma.$transaction(async (tx) => {
            const inspection = await tx.bookingInspection.create({
                data: {
                    booking_id,
                    staff_id,
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

            return inspection;
        });
    }

    async findExistingInspection(booking_id: number, type: InspectionType): Promise<BookingInspection | null> {
        return this.prisma.bookingInspection.findFirst({
            where: { booking_id, type },
        });
    }
}
