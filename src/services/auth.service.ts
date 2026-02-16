import { prisma } from "@/configs/prisma";
import { signToken } from "@/utils/jwt";
import { UserRole, UserStatus } from "../generated/prisma/client";
import type { User, CustomerProfile } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

export const AuthService = {
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

        const result = await prisma.$transaction(async (tx: any) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    username,
                    password_hash: passwordHash,
                    phone,
                    role: UserRole.Customer,
                    status: UserStatus.Active,
                },
            });

            const newProfile = await tx.customerProfile.create({
                data: {
                    user_id: newUser.user_id,
                    full_name,
                    license_number,
                    address,
                    wallet_balance: 0,
                },
            });

            return { user: newUser, profile: newProfile };
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
