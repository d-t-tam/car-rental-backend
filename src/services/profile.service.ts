import { prisma } from "@/configs/prisma";

export class ProfileService {
    static async getProfile(userId: number) {
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include: { customer_profile: true },
        });

        if (!user) {
            throw new Error("User not found");
        }

        return {
            user: {
                user_id: user.user_id,
                email: user.email,
                username: user.username,
                phone: user.phone,
                role: user.role,
                status: user.status,
                created_at: user.created_at,
            },
            profile: user.customer_profile,
        };
    }

    static async updateProfile(userId: number, data: {
        full_name?: string;
        phone?: string;
        license_number?: string;
        address?: string;
    }) {
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include: { customer_profile: true },
        });

        if (!user) {
            throw new Error("User not found");
        }

        if (user.role !== "Customer" || !user.customer_profile) {
            throw new Error("Invalid user profile");
        }

        const [updatedUser, updatedProfile] = await prisma.$transaction([
            prisma.user.update({
                where: { user_id: userId },
                data: {
                    phone: data.phone ?? user.phone,
                },
            }),
            prisma.customerProfile.update({
                where: { user_id: userId },
                data: {
                    full_name: data.full_name ?? user.customer_profile.full_name,
                    license_number: data.license_number ?? user.customer_profile.license_number,
                    address: data.address ?? user.customer_profile.address,
                },
            }),
        ]);

        return {
            user: {
                user_id: updatedUser.user_id,
                email: updatedUser.email,
                username: updatedUser.username,
                phone: updatedUser.phone,
                role: updatedUser.role,
                status: updatedUser.status,
                created_at: updatedUser.created_at,
            },
            profile: updatedProfile,
        };
    }
}
