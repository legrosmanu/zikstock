import { Request, Response, NextFunction } from 'express';
import { ZikresourceService } from '../services/zikresource.service';
import { ZikresourceSchema, ZikresourceResponse } from './zikresource.dto';
import { Zikresource } from '../models/zikresource.domain';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../middleware/error.middleware';

export class ZikresourceController {
    constructor(private zikresourceService: ZikresourceService) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = ZikresourceSchema.safeParse(req.body);
            if (!validation.success) {
                throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${validation.error.message}`);
            }
            const domainModel = await this.zikresourceService.create(validation.data);
            res.status(StatusCodes.CREATED).json(this.toResponse(domainModel));
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.zikresourceService.getAll();
            res.json(result.map(r => this.toResponse(r)));
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.zikresourceService.getById(req.params.id as string);
            res.json(this.toResponse(result));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = ZikresourceSchema.safeParse(req.body);
            if (!validation.success) {
                throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${validation.error.message}`);
            }
            const result = await this.zikresourceService.update(req.params.id as string, validation.data);
            res.json(this.toResponse(result));
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.zikresourceService.delete(req.params.id as string);
            res.status(StatusCodes.NO_CONTENT).send();
        } catch (error) {
            next(error);
        }
    };

    private toResponse(domain: Zikresource): ZikresourceResponse {
        return {
            _id: domain.id,
            url: domain.url,
            artist: domain.artist,
            title: domain.title,
            type: domain.type,
            tags: domain.tags,
        };
    }
}
