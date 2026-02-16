import "dotenv/config";

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_URL: process.env.DIRECT_URL!,
  SERVER_PORT: process.env.SERVER_PORT!,
} as const;
