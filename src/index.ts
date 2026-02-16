import { cors } from "@/configs/cors";
import express, { json } from "express";

const application = express();

application.use(cors());
application.use(json());

application.listen(3000, () => {
  console.log("Server is running on port 3000");
});
