import { prisma } from "@/configs/prisma";
import { UserRepository } from "@/repository/user.repository";
import { NotFoundError } from "@/repository/errors";

export class ProfileService {
    private userRepo: UserRepository;

    constructor() {
        this.userRepo = new UserRepository(prisma);
    }

    async getProfile(userId: number) {
        const result = await this.userRepo.getCustomerProfile(userId);

        if (!result) {
            throw new NotFoundError("User", userId);
        }

        const { user, profile } = result;

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
            profile,
        };
    }

    async updateProfile(
        userId: number,
        data: {
            full_name?: string;
            phone?: string;
            license_number?: string;
            address?: string;
        }
    ) {
        const result = await this.userRepo.getCustomerProfile(userId);

        if (!result) {
            throw new NotFoundError("User", userId);
        }

        if (result.user.role !== "Customer" || !result.profile) {
            throw new Error("Invalid user profile");
        }

        const updateData: {
            full_name?: string;
            license_number?: string;
            address?: string;
        } = {};
        
        if (data.full_name !== undefined) updateData.full_name = data.full_name;
        if (data.license_number !== undefined) updateData.license_number = data.license_number;
        if (data.address !== undefined) updateData.address = data.address;
        
        const updated = await this.userRepo.updateCustomerProfile(userId, updateData);

        if (data.phone && data.phone !== result.user.phone) {
            await this.userRepo.updatePhone(userId, data.phone);
        }

        return {
            user: {
                user_id: updated.user.user_id,
                email: updated.user.email,
                username: updated.user.username,
                phone: updated.user.phone,
                role: updated.user.role,
                status: updated.user.status,
                created_at: updated.user.created_at,
            },
            profile: updated.profile,
        };
    }
}
