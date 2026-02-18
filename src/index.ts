import { authRoutes } from "@/routes/auth.routes";
import { carRoutes } from "@/routes/car.routes";
import { bookingRoutes } from "@/routes/booking.routes";
import { cors } from "@/configs/cors";
import { ENV } from "@/configs/env";
import express, { json } from "express";

const application = express();

application.use(cors());
application.use(json());

application.use("/api/auth", authRoutes);
application.use("/api/cars", carRoutes);
application.use("/api/bookings", bookingRoutes);

const SERVER_PORT = ENV.SERVER_PORT;

application.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});
