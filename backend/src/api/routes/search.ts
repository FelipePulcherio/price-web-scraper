import { Router, Request, Response } from 'express';
import { searchItemByString } from '@/database/operations/dbRead';
import resFormatter from '@/helpers/apiResponseFormatter';

const route = Router();

export default (app: Router) => {
  app.use('/search', route);

  // GET /api/v1/search/quick?q=
  // Used to find up to 5 items from a search
  route.get('/quick', async (req: Request, res: Response) => {
    try {
      const search = req.query.q as string;

      console.log(`GET /api/v1/search/quick?q=${search}`);

      const fetchedItems = await searchItemByString(search, 5, 1);
      // console.log(fetchedItems);

      res
        .status(200)
        .json(resFormatter(true, 'Items fetched successfully', fetchedItems));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Uknown error';

      console.error('GET /api/v1/search/quick?q=', errorMessage);

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

  // GET /api/v1/search/quick?q=
  // Used on regular searches. Use pages with 24 items
  route.get('/', async (req: Request, res: Response) => {
    try {
      const search = req.query.q as string;
      const pageSize = 24;
      const page = parseInt(req.query.page as string, 10) || 1;

      console.log(`GET /api/v1/search?q=${search}`);

      const fetchedItems = await searchItemByString(search, pageSize, page);
      // console.log(fetchedItems);

      res
        .status(200)
        .json(resFormatter(true, 'Items fetched successfully', fetchedItems));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Uknown error';

      console.error('GET /api/v1/search?q=', errorMessage);

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
