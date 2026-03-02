import axios from "axios";
import { prisma } from "./configs/prisma";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus, CarStatus } from "./generated/prisma";

const API_URL = "http://localhost:3000/api";

async function setupTestData() {
    console.log("--- Setting up Test Data ---");

    // 1. Ensure Staff User
    const staffEmail = "staff_test@example.com";
    const passwordHash = await bcrypt.hash("password123", 10);

    await prisma.user.upsert({
        where: { email: staffEmail },
        update: { role: UserRole.Staff, status: UserStatus.Active },
        create: {
            email: staffEmail,
            username: "staff_test",
            password_hash: passwordHash,
            role: UserRole.Staff,
            status: UserStatus.Active,
            phone: "0987654321"
        }
    });
    console.log(`Staff user ensured: ${staffEmail}`);

    // 2. Ensure Customer User
    const customerEmail = "user@example.com";
    await prisma.user.upsert({
        where: { email: customerEmail },
        update: { role: UserRole.Customer, status: UserStatus.Active },
        create: {
            email: customerEmail,
            username: "user_test",
            password_hash: passwordHash,
            role: UserRole.Customer,
            status: UserStatus.Active,
            phone: "0123456789"
        }
    });
    // Ensure customer profile exists
    const customer = await prisma.user.findUnique({ where: { email: customerEmail } });
    if (customer) {
        await prisma.customerProfile.upsert({
            where: { user_id: customer.user_id },
            update: {},
            create: {
                user_id: customer.user_id,
                full_name: "Test User",
                license_number: "LICENSE123",
                address: "123 Street",
                wallet_balance: 0
            }
        });
    }
    console.log(`Customer user ensured: ${customerEmail}`);

    // 3. Ensure Cars exist
    const category = await prisma.carCategory.findFirst();
    let category_id = category?.category_id;
    if (!category_id) {
        const newCat = await prisma.carCategory.create({
            data: { name: "Sedan", description: "Standard sedan", min_price: 50 }
        });
        category_id = newCat.category_id;
    }

    const existingCars = await prisma.car.findMany({ take: 2 });
    if (existingCars.length < 2) {
        await prisma.car.create({
            data: {
                name: "Toyota Vios", brand: "Toyota", model: "Vios", year: 2022, color: "Silver",
                license_plate: "29A-12345", vin_number: "VIN123", status: CarStatus.Available,
                rental_price_per_day: 50, current_mileage: 1000, category_id
            }
        });
        await prisma.car.create({
            data: {
                name: "Honda City", brand: "Honda", model: "City", year: 2021, color: "White",
                license_plate: "29A-67890", vin_number: "VIN678", status: CarStatus.Available,
                rental_price_per_day: 60, current_mileage: 2000, category_id
            }
        });
    }
    console.log("Cars ensured.");

    // IMPORTANT: Re-fetch cars to ensure we have the latest data and satisfy TypeScript
    const cars = await prisma.car.findMany({ take: 2 });
    if (cars.length < 2) {
        throw new Error("Could not ensure two cars for testing.");
    }

    // 4. Clear conflicting bookings
    await prisma.booking.deleteMany({
        where: {
            car_id: { in: [cars[0]!.car_id, cars[1]!.car_id] }
        }
    });
    console.log("Conflicting bookings cleared.");
}

async function testStaffApproval() {
    console.log("\n--- Starting Staff Booking Approval Test ---");

    try {
        await setupTestData();

        // 1. Login as Customer
        console.log("\n1. Logging in as Customer...");
        const customerLogin = await axios.post(`${API_URL}/auth/login`, {
            email: "user@example.com",
            password: "password123"
        });
        const customerToken = customerLogin.data.token;
        console.log("Customer logged in.");

        // 2. Login as Staff
        console.log("\n2. Logging in as Staff...");
        const staffLogin = await axios.post(`${API_URL}/auth/login`, {
            email: "staff_test@example.com",
            password: "password123"
        });
        const staffToken = staffLogin.data.token;
        console.log("Staff logged in.");

        // 3. Create a Booking as Customer
        console.log("\n3. Creating a booking as Customer...");
        const cars = await prisma.car.findMany({ take: 2 });
        if (cars.length < 2) {
            throw new Error("Could not find enough cars for testing.");
        }
        const carId1 = cars[0]!.car_id;
        const carId2 = cars[1]!.car_id;

        const bookingResponse = await axios.post(
            `${API_URL}/bookings`,
            {
                car_id: carId1,
                start_date: new Date(Date.now() + 86400000).toISOString(),
                end_date: new Date(Date.now() + 172800000).toISOString()
            },
            {
                headers: { Authorization: `Bearer ${customerToken}` }
            }
        );
        const bookingId = bookingResponse.data.booking.booking_id;
        console.log(`Booking created with ID: ${bookingId}, Status: ${bookingResponse.data.booking.status}`);

        // 4. Try to Approve as Customer (should fail)
        console.log("\n4. Attempting to approve booking as Customer (should fail)...");
        try {
            await axios.patch(
                `${API_URL}/bookings/${bookingId}/approve`,
                {},
                {
                    headers: { Authorization: `Bearer ${customerToken}` }
                }
            );
            console.error("FAILED: Customer was able to approve their own booking!");
        } catch (error: any) {
            console.log(`SUCCESS: Approval failed as expected (403). Status: ${error.response?.status}`);
        }

        // 5. Approve as Staff (should succeed)
        console.log("\n5. Approving booking as Staff (should succeed)...");
        const approveResponse = await axios.patch(
            `${API_URL}/bookings/${bookingId}/approve`,
            {},
            {
                headers: { Authorization: `Bearer ${staffToken}` }
            }
        );
        console.log(`SUCCESS: Booking approved. New status: ${approveResponse.data.booking.status}`);

        // 6. Create another booking to test Rejection
        console.log("\n6. Creating another booking for rejection test...");
        const booking2Response = await axios.post(
            `${API_URL}/bookings`,
            {
                car_id: carId2,
                start_date: new Date(Date.now() + 86400000).toISOString(),
                end_date: new Date(Date.now() + 172800000).toISOString()
            },
            {
                headers: { Authorization: `Bearer ${customerToken}` }
            }
        );
        const booking2Id = booking2Response.data.booking.booking_id;
        console.log(`Booking 2 created with ID: ${booking2Id}`);

        // 7. Reject as Staff
        console.log("\n7. Rejecting booking as Staff...");
        const rejectResponse = await axios.patch(
            `${API_URL}/bookings/${booking2Id}/reject`,
            { reason: "Document unclear" },
            {
                headers: { Authorization: `Bearer ${staffToken}` }
            }
        );
        console.log(`SUCCESS: Booking rejected. New status: ${rejectResponse.data.booking.status}`);

    } catch (error: any) {
        console.error("Test execution failed:", error.response?.data || error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testStaffApproval();
