import { Router, Request, Response } from 'express';
import { getAllCategories } from '@/database/operations/dbRead';
import resFormatter from '@/helpers/apiResponseFormatter';

const route = Router();

export default (app: Router) => {
  app.use('/categories', route);

  // GET /api/v1/categories/
  // Used to find all categories
  route.get('/', async (req: Request, res: Response) => {
    try {
      console.log('GET /api/v1/categories/');

      const fetchedCategories = await getAllCategories();
      // console.log(fetchedCategories);

      res
        .status(200)
        .json(
          resFormatter(
            true,
            'Categories fetched successfully',
            fetchedCategories
          )
        );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Uknown error';

      console.error('GET /api/v1/categories/', errorMessage);

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
