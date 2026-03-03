import cron from "node-cron";
import { ENV } from "@/configs/env";
import { BookingService } from "@/services/booking.service";

let isRunning = false;

async function runNoShowCancellation() {
    if (isRunning) {
        return;
    }

    isRunning = true;
    try {
        const { cancelledCount, threshold } = await BookingService.autoCancelNoShowBookings(
            ENV.BOOKING_NO_SHOW_GRACE_HOURS
        );

        if (cancelledCount > 0) {
            console.log(
                `[Cron][NoShow] Cancelled ${cancelledCount} booking(s) with start_date <= ${threshold.toISOString()}`
            );
        }
    } catch (error) {
        console.error("[Cron][NoShow] Failed to auto-cancel no-show bookings:", error);
    } finally {
        isRunning = false;
    }
}

export function startBookingNoShowCron() {
    if (!cron.validate(ENV.BOOKING_NO_SHOW_CRON)) {
        console.error(
            `[Cron][NoShow] Invalid BOOKING_NO_SHOW_CRON: ${ENV.BOOKING_NO_SHOW_CRON}. Job was not started.`
        );
        return;
    }

    cron.schedule(ENV.BOOKING_NO_SHOW_CRON, runNoShowCancellation, {
        timezone: ENV.BOOKING_NO_SHOW_TIMEZONE,
    });

    console.log(
        `[Cron][NoShow] Started with schedule "${ENV.BOOKING_NO_SHOW_CRON}", grace=${ENV.BOOKING_NO_SHOW_GRACE_HOURS}h, timezone=${ENV.BOOKING_NO_SHOW_TIMEZONE}`
    );
}
