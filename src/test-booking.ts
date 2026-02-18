import { prisma } from "./configs/prisma";
import { BookingService } from "./services/booking.service";

async function testBooking() {
    try {
        // 1. Get a test customer
        const customer = await prisma.user.findFirst({
            where: { role: 'Customer' }
        });

        if (!customer) {
            console.error("No test customer found");
            return;
        }

        // 2. Get a test car
        const car = await prisma.car.findFirst({
            where: { status: 'Available' }
        });

        if (!car) {
            console.error("No available car found");
            return;
        }

        console.log(`Testing booking for Customer ID: ${customer.user_id} and Car ID: ${car.car_id}`);

        // 3. Create a valid booking
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 3);

        const booking = await BookingService.createBooking({
            customer_id: customer.user_id,
            car_id: car.car_id,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
        });

        console.log("Booking created successfully:", {
            id: booking.booking_id,
            total_price: booking.total_price.toString(),
            status: booking.status
        });

        // 4. Try to create an overlapping booking
        try {
            console.log("Checking overlap detection...");
            await BookingService.createBooking({
                customer_id: customer.user_id,
                car_id: car.car_id,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
            });
            console.error("FAILED: Overlap detection did not catch the conflict");
        } catch (err: any) {
            console.log("SUCCESS: Overlap detected correctly:", err.message);
        }

    } catch (err) {
        console.error("Test Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

testBooking();
