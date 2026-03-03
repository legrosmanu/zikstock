import { Request, Response } from "express";

export class HealthController {

    up = async (req: Request, res: Response) => {
        res.json({
            status: 'UP',
            timestamp: new Date().toISOString()
        });
    };

}