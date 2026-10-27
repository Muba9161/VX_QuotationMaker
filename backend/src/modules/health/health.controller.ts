import { Request, Response, NextFunction } from 'express';
import { healthService } from './health.service';
import { HttpStatus } from '../../core/errors/http-status';
import { createSuccessResponse } from '../../core/types/api-response';

export class HealthController {
  public async checkHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthData = await healthService.getHealth();
      const requestId = req.id || 'unknown';

      // 503 Service Unavailable if critical dependency (PostgreSQL) is down
      const httpStatus =
        healthData.status === 'unhealthy' ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK;

      res.status(httpStatus).json(createSuccessResponse(healthData, requestId));
    } catch (err: unknown) {
      next(err);
    }
  }
}

export const healthController = new HealthController();
