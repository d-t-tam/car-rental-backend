import { PrismaClient, Car, CarStatus, Prisma, BookingStatus } from "../generated/prisma";
import { CarSearchQuery } from "@/types/car";

export class CarRepository {
    constructor(private prisma: PrismaClient) {}

    async findById(car_id: number): Promise<Car | null> {
        return this.prisma.car.findUnique({
            where: { car_id },
            include: {
                category: true,
                images: true,
                bookings: {
                    where: {
                        status: {
                            in: ["Confirmed", "Active", "Deposit_Paid"] as unknown as BookingStatus[],
                        },
                    },
                    orderBy: { start_date: "desc" },
                    take: 1,
                    include: {
                        customer: {
                            include: {
                                user: {
                                    select: {
                                        username: true,
                                        email: true,
                                        phone: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    async findMany(): Promise<Car[]> {
        return this.prisma.car.findMany({
            include: {
                category: true,
                images: true,
            },
        });
    }

    async search(query: CarSearchQuery): Promise<Car[]> {
        const { name, brand, model, category_id, min_price, max_price, status } = query;

        const where: Prisma.CarWhereInput = {
            AND: [
                name ? { name: { contains: name, mode: "insensitive" as Prisma.QueryMode } } : {},
                brand ? { brand: { contains: brand, mode: "insensitive" as Prisma.QueryMode } } : {},
                model ? { model: { contains: model, mode: "insensitive" as Prisma.QueryMode } } : {},
                category_id ? { category_id: Number(category_id) } : {},
                min_price || max_price
                    ? {
                          rental_price_per_day: {
                              ...(min_price ? { gte: new Prisma.Decimal(min_price) } : {}),
                              ...(max_price ? { lte: new Prisma.Decimal(max_price) } : {}),
                          },
                      }
                    : {},
                status ? { status: status as CarStatus } : {},
            ],
        };

        return this.prisma.car.findMany({
            where,
            include: {
                category: true,
                images: true,
            },
        });
    }

    async updateStatus(car_id: number, status: CarStatus): Promise<Car> {
        return this.prisma.car.update({
            where: { car_id },
            data: { status },
        });
    }

    async findByIdWithCategory(car_id: number): Promise<Car | null> {
        return this.prisma.car.findUnique({
            where: { car_id },
            include: { category: true },
        });
    }
}
