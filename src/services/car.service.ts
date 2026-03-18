import { prisma } from "@/configs/prisma";
import { CarRepository } from "@/repository/car.repository";
import { CarSearchQuery } from "@/types/car";

export class CarService {
    private carRepo: CarRepository;

    constructor() {
        this.carRepo = new CarRepository(prisma);
    }

    async search(query: CarSearchQuery) {
        return this.carRepo.search(query);
    }

    async getById(car_id: number) {
        return this.carRepo.findById(car_id);
    }
}
