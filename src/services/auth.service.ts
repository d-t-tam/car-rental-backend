import { prisma } from "@/configs/prisma";
import { UserRepository } from "@/repository/user.repository";
import { signToken } from "@/utils/jwt";
import { UserRole, UserStatus } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

export const AuthService = {
    userRepo: new UserRepository(prisma),

    register: async (data: any) => {
        const { email, password, username, full_name, phone, license_number, address } = data;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            throw new Error("Email or username already exists");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await AuthService.userRepo.createUserWithProfile({
            email,
            username,
            password_hash: passwordHash,
            phone,
            full_name,
            license_number,
            address,
        });

        const token = signToken({ userId: result.user.user_id, role: result.user.role });

        return { token, user: result.user, profile: result.profile };
    },

    login: async (data: any) => {
        const { email, password } = data;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        if (user.status !== UserStatus.Active) {
            throw new Error("User account is not active");
        }

        const token = signToken({ userId: user.user_id, role: user.role });

        return { token, user };
    },
};
