import { PrismaClient, User, UserRole, UserStatus } from "../generated/prisma";
import { NotFoundError } from "./errors";

export class UserRepository {
    constructor(private prisma: PrismaClient) {}

    async findById(user_id: number): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { user_id },
            include: { customer_profile: true },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });
    }

    async create(data: {
        email: string;
        username: string;
        password_hash: string;
        phone: string | null;
        role: UserRole;
        status: UserStatus;
    }): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    async createUserWithProfile(data: {
        email: string;
        username: string;
        password_hash: string;
        phone?: string;
        full_name: string;
        license_number?: string;
        address?: string;
    }): Promise<{ user: User; profile: unknown }> {
        const { email, username, password_hash, phone, full_name, license_number, address } = data;

        return this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    username,
                    password_hash,
                    phone: phone ?? null,
                    role: UserRole.Customer,
                    status: UserStatus.Active,
                },
            });

            const newProfile = await tx.customerProfile.create({
                data: {
                    user_id: newUser.user_id,
                    full_name,
                    license_number: license_number ?? null,
                    address: address ?? null,
                    wallet_balance: 0,
                },
            });

            return { user: newUser, profile: newProfile };
        });
    }

    async updatePhone(user_id: number, phone: string): Promise<User> {
        return this.prisma.user.update({
            where: { user_id },
            data: { phone },
        });
    }

    async getCustomerProfile(user_id: number): Promise<{ user: User; profile: unknown } | null> {
        const user = await this.prisma.user.findUnique({
            where: { user_id },
            include: { customer_profile: true },
        });

        if (!user) return null;

        return {
            user,
            profile: user.customer_profile,
        };
    }

    async updateCustomerProfile(
        user_id: number,
        data: {
            full_name?: string;
            license_number?: string;
            address?: string;
        }
    ): Promise<{ user: User; profile: unknown }> {
        const user = await this.prisma.user.findUnique({
            where: { user_id },
            include: { customer_profile: true },
        });

        if (!user || !user.customer_profile) {
            throw new NotFoundError("CustomerProfile", user_id);
        }

        const [updatedUser, updatedProfile] = await this.prisma.$transaction([
            this.prisma.user.update({
                where: { user_id },
                data: { phone: user.phone },
            }),
            this.prisma.customerProfile.update({
                where: { user_id },
                data: {
                    full_name: data.full_name ?? user.customer_profile.full_name,
                    license_number: data.license_number ?? user.customer_profile.license_number,
                    address: data.address ?? user.customer_profile.address,
                },
            }),
        ]);

        return { user: updatedUser, profile: updatedProfile };
    }

    async findStaffProfile(user_id: number): Promise<unknown | null> {
        return this.prisma.staffProfile.findUnique({
            where: { user_id },
            include: { user: true },
        });
    }
}
