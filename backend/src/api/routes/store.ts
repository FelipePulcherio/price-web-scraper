import { Router, Request, Response, NextFunction } from 'express';
import { getAllStores } from '@/database/operations/dbRead';
import resFormatter from '@/helpers/apiResponseFormatter';

const route = Router();

export default (app: Router) => {
  app.use('/stores', route);

  // GET /api/v1/stores/
  // Used to find all stores
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
    } catch (error) {
      // Pass errors to middlewares.errorHandler
      next(error);
    }
  });
};
