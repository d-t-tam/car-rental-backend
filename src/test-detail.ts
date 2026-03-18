import { CarService } from "./services/car.service";

const carService = new CarService();

async function verifyDetail() {
    console.log("--- Verifying UC24: View Car Details ---");
    try {
        const cars = await carService.search({});
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

        const detail = await carService.getById(testCarId);

        if (!detail) {
            console.error("❌ Car not found");
            return;
        }

        const detailAny = detail as any;
        console.log("Car Detail retrieved successfully:");
        console.log(`Name: ${detail.name}`);
        console.log(`Category: ${detailAny.category?.name}`);
        console.log(`Images Count: ${detailAny.images?.length}`);
        console.log(`Bookings Count: ${detailAny.bookings?.length || 0}`);

        if (detailAny.bookings && detailAny.bookings.length > 0) {
            console.log("Active/Recent Booking found:");
            console.log(`- Booking ID: ${detailAny.bookings[0].booking_id}`);
            console.log(`- Status: ${detailAny.bookings[0].status}`);
            console.log(`- Customer: ${detailAny.bookings[0].customer?.full_name}`);
        }

        console.log("\n✅ UC24 Verification PASSED");
    } catch (error) {
        console.error("❌ Verification FAILED:", error);
    }
}

verifyDetail();
