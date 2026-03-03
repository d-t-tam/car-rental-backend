import "dotenv/config";

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_URL: process.env.DIRECT_URL!,
  SERVER_PORT: process.env.SERVER_PORT!,
  JWT_SECRET: process.env.JWT_SECRET || "supersecretkey123",
  BOOKING_NO_SHOW_CRON: process.env.BOOKING_NO_SHOW_CRON || "*/30 * * * *",
  BOOKING_NO_SHOW_GRACE_HOURS: Number(process.env.BOOKING_NO_SHOW_GRACE_HOURS || "2"),
  BOOKING_NO_SHOW_TIMEZONE: process.env.BOOKING_NO_SHOW_TIMEZONE || "Asia/Bangkok",
} as const;
