import { CarService } from "./services/car.service";
import { prisma } from "./configs/prisma";

async function main() {
    console.log("Starting Car Search Verification...");

    try {
        // 1. Create a test category if not exists
        const category = await prisma.carCategory.upsert({
            where: { category_id: 1 },
            update: {},
            create: {
                category_id: 1,
                name: "Test Category",
                min_price: 100,
            },
        });
        console.log("Category ready.");

        // 2. Create some test cars
        await prisma.car.upsert({
            where: { license_plate: "TEST-001" },
            update: {},
            create: {
                name: "Toyota Camry",
                brand: "Toyota",
                model: "Camry",
                year: 2022,
                color: "Black",
                license_plate: "TEST-001",
                vin_number: "VIN001",
                status: "Available",
                rental_price_per_day: 500,
                current_mileage: 1000,
                category_id: category.category_id,
            }
        });

        await prisma.car.upsert({
            where: { license_plate: "TEST-002" },
            update: {},
            create: {
                name: "Honda Civic",
                brand: "Honda",
                model: "Civic",
                year: 2021,
                color: "White",
                license_plate: "TEST-002",
                vin_number: "VIN002",
                status: "Rented",
                rental_price_per_day: 400,
                current_mileage: 2000,
                category_id: category.category_id,
            }
        });
        console.log("Test cars ready.");

        // 3. Test search by name
        console.log("Testing search by name 'Toyota'...");
        const toyotaCars = await CarService.search({ name: "Toyota" });
        console.log(`Found ${toyotaCars.length} cars. (Expected: 1)`);

        // 4. Test search by price range
        console.log("Testing search by price range 450-550...");
        const midRangeCars = await CarService.search({ min_price: 450, max_price: 550 });
        console.log(`Found ${midRangeCars.length} cars. (Expected: 1)`);

        // 5. Test search by status
        console.log("Testing search by status 'Rented'...");
        const rentedCars = await CarService.search({ status: "Rented" });
        console.log(`Found ${rentedCars.length} cars. (Expected: 1)`);

        if (toyotaCars.length === 1 && midRangeCars.length === 1 && rentedCars.length === 1) {
            console.log("✅ Service Verification PASSED");
        } else {
            console.error("❌ Service Verification FAILED");
        }

    } catch (error) {
        console.error("❌ Verification FAILED with error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
