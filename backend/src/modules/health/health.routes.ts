import { Router } from 'express';
import { healthController } from './health.controller';

const router = Router();

router.get('/', (req, res, next) => healthController.checkHealth(req, res, next));

export const healthRoutes = router;
