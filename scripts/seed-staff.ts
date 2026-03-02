import bcrypt from "bcryptjs";
import { prisma } from "../src/configs/prisma";
import { UserRole, UserStatus } from "../src/generated/prisma/client";

async function seedStaff() {
    const staffEmail = "staff.demo@example.com";
    const staffUsername = "staff_demo";
    const staffPassword = "Staff@123";
    const staffCode = "STF-DEMO-001";
    const phone = "0900000001";

    const passwordHash = await bcrypt.hash(staffPassword, 10);

    const staffUser = await prisma.user.upsert({
        where: { email: staffEmail },
        update: {
            username: staffUsername,
            password_hash: passwordHash,
            phone,
            role: UserRole.Staff,
            status: UserStatus.Active,
        },
        create: {
            email: staffEmail,
            username: staffUsername,
            password_hash: passwordHash,
            phone,
            role: UserRole.Staff,
            status: UserStatus.Active,
        },
    });

    await prisma.staffProfile.upsert({
        where: { user_id: staffUser.user_id },
        update: { staff_code: staffCode },
        create: {
            user_id: staffUser.user_id,
            staff_code: staffCode,
        },
    });

    console.log("Seeded staff account successfully:");
    console.log(`- email: ${staffEmail}`);
    console.log(`- password: ${staffPassword}`);
    console.log(`- role: ${UserRole.Staff}`);
    console.log(`- staff_code: ${staffCode}`);
}

seedStaff()
    .catch((error) => {
        console.error("Failed to seed staff account:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
