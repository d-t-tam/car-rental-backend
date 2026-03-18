import bcrypt from "bcryptjs";
import { prisma } from "../src/configs/prisma";

async function updatePassword() {
    const password = "Customer123!";
    const hash = await bcrypt.hash(password, 10);
    
    await prisma.user.update({
        where: { email: "customer1@example.com" },
        data: { password_hash: hash }
    });
    
    console.log(`✅ Password updated for customer1@example.com to: ${password}`);
    await prisma.$disconnect();
}

updatePassword();
