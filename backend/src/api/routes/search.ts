import { Router, Request, Response, NextFunction } from 'express';
import { searchItemByString } from '@/database/operations/dbRead';
import resFormatter from '@/helpers/apiResponseFormatter';
import middlewares from '../middlewares';

const route = Router();

export default (app: Router) => {
  app.use('/search', route);

  // GET /api/v1/search/quick?q=
  // Used to find up to 5 items from a search
  route.get(
    '/quick',
    middlewares.validateSearch,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const search = req.query.q as string;

        console.log(`GET /api/v1/search/quick?q=${search}`);

        let fetchedItems = await searchItemByString(search, 5, 1);
        // console.log(fetchedItems);

        // Transform urls
        fetchedItems = fetchedItems.map((item) => ({
          ...item,
          image: {
            ...item.image,
            url: item.image.url?.replace(
              'f_auto,q_auto/',
              'f_auto,q_auto/w_150,h_150/'
            ),
          },
        }));

        res
          .status(200)
          .json(
            resFormatter(true, ['Items fetched successfully'], fetchedItems)
          );
      } catch (error) {
        // Pass errors to middlewares.errorHandler
        next(error);
      }
    }
  );

  // GET /api/v1/search?q=
  // Used on regular searches. Use pages with 24 items
  route.get(
    '/',
    middlewares.validateSearch,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const search = req.query.q as string;
        const pageSize = 24;
        const page = parseInt(req.query.page as string, 10) || 1;

        console.log(`GET /api/v1/search?q=${search}`);

        const fetchedItems = await searchItemByString(search, pageSize, page);
        // console.log(fetchedItems);

        res
          .status(200)
          .json(
            resFormatter(true, ['Items fetched successfully'], fetchedItems)
          );
      } catch (error) {
        // Pass errors to middlewares.errorHandler
        next(error);
      }
    }
  );
};
