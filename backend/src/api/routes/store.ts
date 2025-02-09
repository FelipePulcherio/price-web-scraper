import { Router, Request, Response } from 'express';
import { getAllStores } from '@/database/operations/dbRead';
import resFormatter from '@/helpers/apiResponseFormatter';

const route = Router();

export default (app: Router) => {
  app.use('/stores', route);

  // GET /api/v1/stores/
  // Used to find all stores
  route.get('/', async (req: Request, res: Response) => {
    try {
      console.log('GET /api/v1/categories/');

      const fetchedStores = await getAllStores();
      // console.log(fetchedStores);

      res
        .status(200)
        .json(resFormatter(true, 'Stores fetched successfully', fetchedStores));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Uknown error';

      console.error('GET /api/v1/stores/', errorMessage);

      // Not found
      if (errorMessage.includes('Not found')) {
        res.status(404).json(resFormatter(false, errorMessage, null));
      }
      // All other errors
      else {
        res
          .status(500)
          .json(resFormatter(false, 'Internal server error', null));
      }
    }
  });
};
