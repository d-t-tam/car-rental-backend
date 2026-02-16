import { authRoutes } from "@/routes/auth.routes";
import { cors } from "@/configs/cors";
import { ENV } from "@/configs/env";
import express, { json } from "express";

const application = express();

application.use(cors());
application.use(json());

application.use("/api/auth", authRoutes);

const SERVER_PORT = ENV.SERVER_PORT;

application.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});
