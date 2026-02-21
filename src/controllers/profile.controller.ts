import { ProfileService } from "@/services/profile.service";
import { BuildRequest } from "@/middlewares/auth.middleware";
import { Response } from "express";

export class ProfileController {
    static async getProfile(req: BuildRequest, res: Response) {
        try {
            const userId = req.user.userId;
            const profile = await ProfileService.getProfile(userId);
            res.status(200).json(profile);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async updateProfile(req: BuildRequest, res: Response) {
        try {
            const userId = req.user.userId;
            const data = req.body;
            const profile = await ProfileService.updateProfile(userId, data);
            res.status(200).json(profile);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}
