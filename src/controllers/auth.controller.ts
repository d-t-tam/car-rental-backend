import { AuthService } from "@/services/auth.service";
import type { Request, Response } from "express";

export const AuthController = {
    register: async (req: Request, res: Response) => {
        try {
            const result = await AuthService.register(req.body);
            res.status(201).json({ message: "Registration successful", ...result });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const result = await AuthService.login(req.body);
            res.status(200).json({ message: "Login successful", ...result });
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    },
};
