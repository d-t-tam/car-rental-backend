import { verifyToken } from "@/utils/jwt";
import { NextFunction, Request, Response } from "express";

export interface BuildRequest extends Request {
    user?: any;
}

export const authenticate = (
    req: BuildRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }

    req.user = decoded;
    next();
};
