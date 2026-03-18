import bcrypt from "bcryptjs";
import { prisma } from "../src/configs/prisma";
import { UserRole, UserStatus } from "../src/generated/prisma/client";

interface UserSeed {
    username: string;
    email: string;
    password: string;
    phone: string | null;
    role: UserRole;
    status: UserStatus;
    full_name: string;
    license_number?: string;
    address?: string;
    staff_code?: string;
}

const users: UserSeed[] = [
    {
        username: "admin",
        email: "admin@swd392.com",
        password: "Admin123!",
        phone: "0900000001",
        role: UserRole.Admin,
        status: UserStatus.Active,
        full_name: "System Administrator",
    },
    {
        username: "manager",
        email: "manager@swd392.com",
        password: "Manager123!",
        phone: "0900000002",
        role: UserRole.Manager,
        status: UserStatus.Active,
        full_name: "Branch Manager",
    },
    {
        username: "staff1",
        email: "staff1@swd392.com",
        password: "Staff123!",
        phone: "0900000011",
        role: UserRole.Staff,
        status: UserStatus.Active,
        full_name: "John Staff",
        staff_code: "STF001",
    },
    {
        username: "staff2",
        email: "staff2@swd392.com",
        password: "Staff123!",
        phone: "0900000012",
        role: UserRole.Staff,
        status: UserStatus.Active,
        full_name: "Jane Staff",
        staff_code: "STF002",
    },
    {
        username: "staff3",
        email: "staff3@swd392.com",
        password: "Staff123!",
        phone: "0900000013",
        role: UserRole.Staff,
        status: UserStatus.Active,
        full_name: "Bob Staff",
        staff_code: "STF003",
    },
    {
        username: "customer1",
        email: "customer1@example.com",
        password: "Customer123!",
        phone: "0900000101",
        role: UserRole.Customer,
        status: UserStatus.Active,
        full_name: "Alice Customer",
        license_number: "DL-123456789",
        address: "123 Main St, District 1, Ho Chi Minh City",
    },
    {
        username: "customer2",
        email: "customer2@example.com",
        password: "Customer123!",
        phone: "0900000102",
        role: UserRole.Customer,
        status: UserStatus.Active,
        full_name: "Bob Customer",
        license_number: "DL-987654321",
        address: "456 Oak Ave, District 2, Ho Chi Minh City",
    },
    {
        username: "customer3",
        email: "customer3@example.com",
        password: "Customer123!",
        phone: "0900000103",
        role: UserRole.Customer,
        status: UserStatus.Active,
        full_name: "Charlie Customer",
        license_number: "DL-456789123",
        address: "789 Pine Rd, District 3, Ho Chi Minh City",
    },
    {
        username: "customer4",
        email: "customer4@example.com",
        password: "Customer123!",
        phone: "0900000104",
        role: UserRole.Customer,
        status: UserStatus.Active,
        full_name: "Diana Customer",
    },
    {
        username: "customer5",
        email: "customer5@example.com",
        password: "Customer123!",
        phone: "0900000105",
        role: UserRole.Customer,
        status: UserStatus.Active,
        full_name: "Eve Customer",
    },
];

async function seedUsers() {
    console.log("🚀 Starting user seed...\n");

    const hashedPassword = await bcrypt.hash("DefaultPass123!", 10);

    let adminUserId: number | null = null;

    for (const userData of users) {
        try {
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [{ email: userData.email }, { username: userData.username }],
                },
            });

            if (existingUser) {
                console.log(`⚠️  User already exists: ${userData.username} (${userData.email}) - SKIPPING`);
                if (userData.role === UserRole.Admin) {
                    adminUserId = existingUser.user_id;
                }
                continue;
            }

            const user = await prisma.user.create({
                data: {
                    username: userData.username,
                    email: userData.email,
                    password_hash: hashedPassword,
                    phone: userData.phone,
                    role: userData.role,
                    status: userData.status,
                },
            });

            console.log(`✅ Created user: ${userData.username} (${userData.role})`);

            if (userData.role === UserRole.Admin) {
                adminUserId = user.user_id;
                console.log(`   📌 Admin user_id: ${user.user_id}`);
            }

            if (userData.role === UserRole.Staff && userData.staff_code) {
                await prisma.staffProfile.create({
                    data: {
                        user_id: user.user_id,
                        staff_code: userData.staff_code,
                    },
                });
                console.log(`   📌 Staff profile created with code: ${userData.staff_code}`);
            }

            if (userData.role === UserRole.Customer) {
                await prisma.customerProfile.create({
                    data: {
                        user_id: user.user_id,
                        full_name: userData.full_name,
                        license_number: userData.license_number ?? null,
                        address: userData.address ?? null,
                        wallet_balance: 0,
                    },
                });
                console.log(`   📌 Customer profile created for: ${userData.full_name}`);
            }

            if (userData.role === UserRole.Manager) {
                await prisma.staffProfile.create({
                    data: {
                        user_id: user.user_id,
                        staff_code: `MGR001`,
                    },
                });
                console.log(`   📌 Manager profile created`);
            }
        } catch (error) {
            console.error(`❌ Error creating user ${userData.username}:`, error);
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 SEED SUMMARY");
    console.log("=".repeat(50));
    console.log(`\n👥 Users created: ${users.length}`);
    console.log("\n🔑 Default password for all users: DefaultPass123!");
    console.log("\n📋 Account list:");

    console.log("\n  [Admin]");
    console.log("  - admin@swd392.com / DefaultPass123!");

    console.log("\n  [Manager]");
    console.log("  - manager@swd392.com / DefaultPass123!");

    console.log("\n  [Staff]");
    console.log("  - staff1@swd392.com / DefaultPass123!");
    console.log("  - staff2@swd392.com / DefaultPass123!");
    console.log("  - staff3@swd392.com / DefaultPass123!");

    console.log("\n  [Customers]");
    console.log("  - customer1@example.com / DefaultPass123!");
    console.log("  - customer2@example.com / DefaultPass123!");
    console.log("  - customer3@example.com / DefaultPass123!");
    console.log("  - customer4@example.com / DefaultPass123!");
    console.log("  - customer5@example.com / DefaultPass123!");

    if (adminUserId) {
        console.log(`\n📌 Admin user_id for reference: ${adminUserId}`);
    }

    console.log("\n✅ Seed completed!\n");
}

seedUsers()
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
