import { prisma } from "@/configs/prisma";
import { CarSearchQuery } from "@/types/car";
import { CarStatus, Prisma } from "../generated/prisma/client";

export class CarService {
    static async search(query: CarSearchQuery) {
        const { name, brand, model, category_id, min_price, max_price, status } = query;

        const where: Prisma.CarWhereInput = {
            AND: [
                name ? { name: { contains: name, mode: 'insensitive' as Prisma.QueryMode } } : {},
                brand ? { brand: { contains: brand, mode: 'insensitive' as Prisma.QueryMode } } : {},
                model ? { model: { contains: model, mode: 'insensitive' as Prisma.QueryMode } } : {},
                category_id ? { category_id: Number(category_id) } : {},
                min_price || max_price ? {
                    rental_price_per_day: {
                        ...(min_price ? { gte: new Prisma.Decimal(min_price) } : {}),
                        ...(max_price ? { lte: new Prisma.Decimal(max_price) } : {}),
                    }
                } : {},
                status ? { status: status as CarStatus } : {},
            ],
        };

        return await prisma.car.findMany({
            where,
            include: {
                category: true,
                images: true,
            },
        });
    }

    static async getById(car_id: number) {
        return await prisma.car.findUnique({
            where: { car_id },
            include: {
                category: true,
                images: true,
                bookings: {
                    where: {
                        status: {
                            in: ['Confirmed', 'Active', 'Deposit_Paid' as any]
                        }
                    },
                    orderBy: {
                        start_date: 'desc'
                    },
                    take: 1,
                    include: {
                        customer: {
                            include: {
                                user: {
                                    select: {
                                        username: true,
                                        email: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });
    }
}
