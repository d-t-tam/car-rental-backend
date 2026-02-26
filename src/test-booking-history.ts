import { prisma } from "./configs/prisma";
import { BookingService } from "./services/booking.service";

async function testBookingHistory() {
    try {
        // 1. Get a test customer
        const customer = await prisma.user.findFirst({
            where: { role: 'Customer' }
        });

        if (!customer) {
            console.error("No test customer found");
            return;
        }

        console.log(`Testing booking history for Customer ID: ${customer.user_id}`);

        // 2. Fetch booking history
        const bookings = await BookingService.getCustomerBookings(customer.user_id);

        console.log(`Found ${bookings.length} bookings.`);
        const firstBooking = bookings[0];
        if (firstBooking) {
            console.log("First booking details:", {
                booking_id: firstBooking.booking_id,
                car_name: firstBooking.car.name,
                status: firstBooking.status
            });
        }

        console.log("SUCCESS: Booking history fetched correctly.");

    } catch (err) {
        console.error("Test Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

testBookingHistory();
