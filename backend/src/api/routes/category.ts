import { Router, Request, Response, NextFunction } from 'express';
import { getAllCategories } from '@/database/operations/dbRead';
import resFormatter from '@/helpers/apiResponseFormatter';

const route = Router();

function categoryRoute(app: Router): void {
  app.use('/categories', route);

  // GET /api/v1/categories/
  route.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('GET /api/v1/categories/');

      const fetchedCategories = await getAllCategories();
      // console.log(fetchedCategories);

      res
        .status(200)
        .json(
          resFormatter(
            true,
            ['Categories fetched successfully'],
            fetchedCategories
          )
        );
    } catch (err) {
      // Pass errors to middlewares.errorHandler
      next(err);
    }
  });
}

export default categoryRoute;
