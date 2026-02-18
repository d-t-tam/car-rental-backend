import { CarController } from "@/controllers/car.controller";
import { Router } from "express";

const carRoutes = Router();

carRoutes.get("/search", CarController.search);
carRoutes.get("/:id", CarController.getById);

export { carRoutes };
