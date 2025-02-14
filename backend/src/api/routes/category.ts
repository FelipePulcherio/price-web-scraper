import { Router, Request, Response, NextFunction } from 'express';
import { getAllCategories } from '@/database/operations/dbRead';
import resFormatter from '@/helpers/apiResponseFormatter';

const route = Router();

export default (app: Router) => {
  app.use('/categories', route);

  // GET /api/v1/categories/
  // Used to find all categories
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
    } catch (error) {
      // Pass errors to middlewares.errorHandler
      next(error);
    }
  });
};
