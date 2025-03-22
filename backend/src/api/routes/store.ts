import { Router, Request, Response, NextFunction } from 'express';
import { getAllStores } from '@/database/operations/dbRead';
import resFormatter from '@/helpers/apiResponseFormatter';

const route = Router();

function storeRoute(app: Router): void {
  app.use('/stores', route);

  // GET /api/v1/stores/
  route.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('GET /api/v1/stores/');

      const fetchedStores = await getAllStores();
      // console.log(fetchedStores);

      res
        .status(200)
        .json(
          resFormatter(true, ['Stores fetched successfully'], fetchedStores)
        );
    } catch (err) {
      // Pass errors to middlewares.errorHandler
      next(err);
    }
  });
}

export default storeRoute;
