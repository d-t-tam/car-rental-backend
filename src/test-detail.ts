import { CarService } from "./services/car.service";

async function verifyDetail() {
    console.log("--- Verifying UC24: View Car Details ---");
    try {
        // Fetch all cars to get a valid ID
        const cars = await CarService.search({});
        if (cars.length === 0) {
            console.log("No cars found in database. Please run test-search.ts first to seed data.");
            return;
        }

        const firstCar = cars[0];
        if (!firstCar) {
            console.log("No cars found in database.");
            return;
        }
        const testCarId = firstCar.car_id;
        console.log(`Testing with Car ID: ${testCarId}`);

        const detail = await CarService.getById(testCarId);

        if (!detail) {
            console.error("❌ Car not found");
            return;
        }

        console.log("Car Detail retrieved successfully:");
        console.log(`Name: ${detail.name}`);
        console.log(`Category: ${detail.category?.name}`);
        console.log(`Images Count: ${detail.images?.length}`);
        console.log(`Bookings Count: ${(detail as any).bookings?.length || 0}`);

        if ((detail as any).bookings && (detail as any).bookings.length > 0) {
            console.log("Active/Recent Booking found:");
            console.log(`- Booking ID: ${(detail as any).bookings[0].booking_id}`);
            console.log(`- Status: ${(detail as any).bookings[0].status}`);
            console.log(`- Customer: ${(detail as any).bookings[0].customer.full_name}`);
        }

        console.log("\n✅ UC24 Verification PASSED");
    } catch (error) {
        console.error("❌ Verification FAILED:", error);
    }
}

verifyDetail();
