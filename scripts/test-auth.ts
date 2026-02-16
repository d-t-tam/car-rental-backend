import { AuthService } from "../src/services/auth.service";
import { prisma } from "../src/configs/prisma";

async function main() {
    console.log("Starting Auth Verification...");

    const testUser = {
        email: "test_customer@example.com",
        username: "test_customer",
        password: "password123",
        full_name: "Test Customer",
        phone: "1234567890",
        license_number: "LICENSE123",
        address: "123 Test St",
    };

    try {
        // Clean up previous run
        await prisma.user.deleteMany({
            where: { email: testUser.email },
        });
        console.log("Cleaned up existing test user.");

        // Test Register
        console.log("Testing Register...");
        const registerResult = await AuthService.register(testUser);
        console.log("Register Successful:", registerResult.token ? "Token received" : "No token");

        // Test Login
        console.log("Testing Login...");
        const loginResult = await AuthService.login({
            email: testUser.email,
            password: testUser.password,
        });
        console.log("Login Successful:", loginResult.token ? "Token received" : "No token");

        if (registerResult.token && loginResult.token) {
            console.log("✅ Verification PASSED");
        } else {
            console.error("❌ Verification FAILED");
        }

    } catch (error) {
        console.error("❌ Verification FAILED with error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
