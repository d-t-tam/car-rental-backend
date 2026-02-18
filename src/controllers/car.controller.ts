import { CarService } from "@/services/car.service";
import { Request, Response } from "express";

export class CarController {
    static async search(req: Request, res: Response) {
        try {
            const query = req.query;
            const cars = await CarService.search(query);
            res.status(200).json(cars);
        } catch (error: any) {
            res.status(500).json({ message: error.message || "Internal server error" });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const car = await CarService.getById(Number(id));
            if (!car) {
                return res.status(404).json({ message: "Car not found" });
            }
            res.status(200).json(car);
        } catch (error: any) {
            res.status(500).json({ message: error.message || "Internal server error" });
        }
    }
}
