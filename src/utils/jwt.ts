import { ENV } from "@/configs/env";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

const SECRET = ENV.JWT_SECRET;

export const signToken = (payload: object, options?: SignOptions) => {
    return jwt.sign(payload, SECRET, { expiresIn: "1d", ...options });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        return null;
    }
};
