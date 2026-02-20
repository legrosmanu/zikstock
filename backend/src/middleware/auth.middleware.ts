import { NextFunction, Request, Response } from "express";

export interface AuthMiddleware {
    authMiddleware(req: Request, res: Response, next: NextFunction): void;
}