import bcrypt from "bcryptjs";
import { prisma } from "../src/configs/prisma";
import { UserRole, UserStatus, CarStatus } from "../src/generated/prisma/client";

interface CarSeed {
    name: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
    vin_number: string;
    status: CarStatus;
    rental_price_per_day: number;
    current_mileage: number;
    description: string;
    category_name: string;
    image_url?: string;
}

const categories = [
    { name: "SUV", description: "Sport Utility Vehicle - Spacious and versatile", min_price: 800000 },
    { name: "Sedan", description: "Classic sedan for comfortable city driving", min_price: 500000 },
    { name: "Hatchback", description: "Compact and fuel-efficient", min_price: 400000 },
    { name: "Luxury", description: "Premium vehicles for special occasions", min_price: 1500000 },
    { name: "Pickup", description: "Powerful trucks for cargo and adventure", min_price: 900000 },
];

const cars: CarSeed[] = [
    {
        name: "Toyota Corolla Altis",
        brand: "Toyota",
        model: "Corolla Altis",
        year: 2023,
        color: "White",
        license_plate: "51A-12345",
        vin_number: "VINTOYOTA001",
        status: CarStatus.Available,
        rental_price_per_day: 650000,
        current_mileage: 15000,
        description: "Premium sedan with excellent fuel efficiency",
        category_name: "Sedan",
        image_url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
    },
    {
        name: "Honda Civic",
        brand: "Honda",
        model: "Civic",
        year: 2023,
        color: "Black",
        license_plate: "51A-12346",
        vin_number: "VINHONDA001",
        status: CarStatus.Available,
        rental_price_per_day: 700000,
        current_mileage: 12000,
        description: "Modern design with advanced safety features",
        category_name: "Sedan",
        image_url: "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800",
    },
    {
        name: "Mazda CX-5",
        brand: "Mazda",
        model: "CX-5",
        year: 2022,
        color: "Red",
        license_plate: "51A-12347",
        vin_number: "VINMAZDA001",
        status: CarStatus.Available,
        rental_price_per_day: 950000,
        current_mileage: 20000,
        description: "Premium SUV with KODO design language",
        category_name: "SUV",
        image_url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
    },
    {
        name: "Hyundai Tucson",
        brand: "Hyundai",
        model: "Tucson",
        year: 2023,
        color: "Blue",
        license_plate: "51A-12348",
        vin_number: "VINHYUNDAI001",
        status: CarStatus.Available,
        rental_price_per_day: 850000,
        current_mileage: 8000,
        description: "Stylish SUV with smart tech features",
        category_name: "SUV",
        image_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
    },
    {
        name: "Kia Seltos",
        brand: "Kia",
        model: "Seltos",
        year: 2023,
        color: "Orange",
        license_plate: "51A-12349",
        vin_number: "VINKIA001",
        status: CarStatus.Rented,
        rental_price_per_day: 750000,
        current_mileage: 10000,
        description: "Compact SUV perfect for city adventures",
        category_name: "SUV",
        image_url: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
    },
    {
        name: "Toyota Vios",
        brand: "Toyota",
        model: "Vios",
        year: 2022,
        color: "Silver",
        license_plate: "51A-12350",
        vin_number: "VINTOYOTA002",
        status: CarStatus.Available,
        rental_price_per_day: 450000,
        current_mileage: 25000,
        description: "Economical sedan ideal for daily commute",
        category_name: "Sedan",
        image_url: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800",
    },
    {
        name: "Ford Ranger",
        brand: "Ford",
        model: "Ranger",
        year: 2023,
        color: "Black",
        license_plate: "51A-12351",
        vin_number: "VINFORD001",
        status: CarStatus.Available,
        rental_price_per_day: 1200000,
        current_mileage: 5000,
        description: "Powerful pickup truck for tough terrains",
        category_name: "Pickup",
        image_url: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
    },
    {
        name: "Mercedes-Benz C300",
        brand: "Mercedes-Benz",
        model: "C300",
        year: 2023,
        color: "White",
        license_plate: "51A-12352",
        vin_number: "VINMERCEDES001",
        status: CarStatus.Available,
        rental_price_per_day: 2500000,
        current_mileage: 3000,
        description: "Luxury sedan with premium interior",
        category_name: "Luxury",
        image_url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
    },
    {
        name: "BMW 320i",
        brand: "BMW",
        model: "320i",
        year: 2023,
        color: "Grey",
        license_plate: "51A-12353",
        vin_number: "VINBMW001",
        status: CarStatus.Available,
        rental_price_per_day: 2200000,
        current_mileage: 4000,
        description: "Sporty luxury sedan with dynamic performance",
        category_name: "Luxury",
        image_url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
    },
    {
        name: "Honda Jazz",
        brand: "Honda",
        model: "Jazz",
        year: 2022,
        color: "Yellow",
        license_plate: "51A-12354",
        vin_number: "VINHONDA002",
        status: CarStatus.Available,
        rental_price_per_day: 400000,
        current_mileage: 18000,
        description: "Compact hatchback with flexible interior",
        category_name: "Hatchback",
        image_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
    },
    {
        name: "Toyota Yaris",
        brand: "Toyota",
        model: "Yaris",
        year: 2023,
        color: "Red",
        license_plate: "51A-12355",
        vin_number: "VINTOYOTA003",
        status: CarStatus.Available,
        rental_price_per_day: 420000,
        current_mileage: 6000,
        description: "Compact and reliable hatchback",
        category_name: "Hatchback",
        image_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
    },
    {
        name: "Porsche Panamera",
        brand: "Porsche",
        model: "Panamera",
        year: 2023,
        color: "Black",
        license_plate: "51A-12356",
        vin_number: "VINPORSCHE001",
        status: CarStatus.Available,
        rental_price_per_day: 5000000,
        current_mileage: 1000,
        description: "High-performance luxury sports sedan",
        category_name: "Luxury",
        image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    },
    {
        name: "Isuzu D-Max",
        brand: "Isuzu",
        model: "D-Max",
        year: 2022,
        color: "White",
        license_plate: "51A-12357",
        vin_number: "VINISUZU001",
        status: CarStatus.Maintenance,
        rental_price_per_day: 900000,
        current_mileage: 35000,
        description: "Durable pickup for work and play",
        category_name: "Pickup",
        image_url: "https://images.unsplash.com/photo-1549329780-45d19a7a9c22?w=800",
    },
    {
        name: "Lexus ES250",
        brand: "Lexus",
        model: "ES250",
        year: 2023,
        color: "Silver",
        license_plate: "51A-12358",
        vin_number: "VINLEXUS001",
        status: CarStatus.Available,
        rental_price_per_day: 2800000,
        current_mileage: 2000,
        description: "Executive luxury sedan with refined comfort",
        category_name: "Luxury",
        image_url: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800",
    },
];

async function seedCars() {
    console.log("🚗 Starting car seed...\n");

    for (const categoryData of categories) {
        const existingCategory = await prisma.carCategory.findFirst({
            where: { name: categoryData.name },
        });

        if (existingCategory) {
            console.log(`⚠️  Category already exists: ${categoryData.name} - SKIPPING`);
        } else {
            await prisma.carCategory.create({
                data: {
                    name: categoryData.name,
                    description: categoryData.description,
                    min_price: categoryData.min_price,
                },
            });
            console.log(`✅ Created category: ${categoryData.name}`);
        }
    }

    console.log("\n" + "-".repeat(50));

    let carsCreated = 0;
    let carsSkipped = 0;

    for (const carData of cars) {
        try {
            const existingCar = await prisma.car.findFirst({
                where: {
                    OR: [
                        { license_plate: carData.license_plate },
                        { vin_number: carData.vin_number },
                    ],
                },
            });

            if (existingCar) {
                console.log(`⚠️  Car already exists: ${carData.license_plate} - ${carData.name} - SKIPPING`);
                carsSkipped++;
                continue;
            }

            const category = await prisma.carCategory.findFirst({
                where: { name: carData.category_name },
            });

            if (!category) {
                console.error(`❌ Category not found: ${carData.category_name}`);
                continue;
            }

            const car = await prisma.car.create({
                data: {
                    name: carData.name,
                    brand: carData.brand,
                    model: carData.model,
                    year: carData.year,
                    color: carData.color,
                    license_plate: carData.license_plate,
                    vin_number: carData.vin_number,
                    status: carData.status,
                    rental_price_per_day: carData.rental_price_per_day,
                    current_mileage: carData.current_mileage,
                    description: carData.description,
                    category_id: category.category_id,
                },
            });

            console.log(`✅ Created car: ${car.name} (${carData.license_plate}) - ${carData.status}`);

            if (carData.image_url) {
                await prisma.carImage.create({
                    data: {
                        car_id: car.car_id,
                        image_url: carData.image_url,
                        is_thumbnail: true,
                    },
                });
                console.log(`   📷 Added thumbnail image`);
            }

            carsCreated++;
        } catch (error) {
            console.error(`❌ Error creating car ${carData.name}:`, error);
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 CAR SEED SUMMARY");
    console.log("=".repeat(50));
    console.log(`\n🚗 Cars created: ${carsCreated}`);
    console.log(`⚠️  Cars skipped: ${carsSkipped}`);
    console.log(`📁 Categories: ${categories.length}`);

    console.log("\n🚗 Car List:");
    console.log("-".repeat(50));

    for (const carData of cars) {
        const statusIcon = carData.status === CarStatus.Available ? "✅" :
                         carData.status === CarStatus.Rented ? "🚙" :
                         carData.status === CarStatus.Maintenance ? "🔧" : "❌";
        console.log(`${statusIcon} ${carData.brand} ${carData.name} - ${carData.license_plate}`);
        console.log(`   💰 ${carData.rental_price_per_day.toLocaleString()} VND/day | ${carData.year} | ${carData.color}`);
    }

    console.log("\n✅ Car seed completed!\n");
}

seedCars()
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
