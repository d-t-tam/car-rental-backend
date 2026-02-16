import "dotenv/config";

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_URL: process.env.DIRECT_URL!,
  SERVER_PORT: process.env.SERVER_PORT!,
  JWT_SECRET: process.env.JWT_SECRET || "supersecretkey123",
} as const;
