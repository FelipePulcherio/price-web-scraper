import { Router, Request, Response, NextFunction } from 'express';
import {
  getCurrentPricesByItemId,
  getItemById,
  getItemDeals,
  getItemsByCategoryId,
  getLowestPricesByItemId,
} from '@/database/operations/dbRead';
import resFormatter from '@/helpers/apiResponseFormatter';

const route = Router();

function itemRoute(app: Router): void {
  app.use('/items', route);

  // GET /api/v1/items/current/:itemId
  route.get(
    '/current/:itemId',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const itemId = parseInt(req.params.itemId, 10);
        console.log(
          `GET /api/v1/items/current/:itemId Request param: ${itemId}`
        );

        let fetchedItem = await getCurrentPricesByItemId(itemId);
        // console.log(fetchedItem);

        res
          .status(200)
          .json(resFormatter(true, ['Item fetched successfully'], fetchedItem));
      } catch (err) {
        // Pass errors to middlewares.errorHandler
        next(err);
      }
    }
  );

  // GET /api/v1/items/mainDeals
  route.get(
    '/mainDeals',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log(`GET /api/v1/items/mainDeals`);

        let fetchedItem = await getItemDeals(5);
        // console.log(fetchedItem);

        // Adjust width and height from cloudinary urls
        fetchedItem = fetchedItem.map((item) => ({
          ...item,
          image: {
            ...item.image,
            url: item.image.url?.replace(
              'f_auto,q_auto/',
              'f_auto,q_auto/w_250,h_250/'
            ),
          },
        }));

        res
          .status(200)
          .json(resFormatter(true, ['Item fetched successfully'], fetchedItem));
      } catch (err) {
        // Pass errors to middlewares.errorHandler
        next(err);
      }
    }
  );

  // GET /api/v1/items/category/:categoryId?page=
  // Used to find all items that are related to a categoryId
  route.get(
    '/category/:categoryId',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const categoryId = parseInt(req.params.categoryId, 10);
        const pageSize = 24;
        const page = parseInt(req.query.page as string, 10) || 1;

        console.log(
          `GET /api/v1/items/category/:categoryId Request param: ${categoryId}`
        );

        const fetchedItems = await getItemsByCategoryId(
          categoryId,
          pageSize,
          page
        );
        // console.log(fetchedItems);

        res
          .status(200)
          .json(
            resFormatter(true, ['Items fetched successfully'], fetchedItems)
          );
      } catch (err) {
        // Pass errors to middlewares.errorHandler
        next(err);
      }
    }
  );

  // GET /api/v1/items/history/30/:itemId
  // Used to get last 30 days prices of a specific item
  route.get(
    '/history/30/:itemId',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const itemId = parseInt(req.params.itemId, 10);
        console.log(`GET /api/v1/items/history/30/${itemId}`);

        const fetchedPrices = await getLowestPricesByItemId(itemId, 30);
        // console.log(fetchedItem);

        res
          .status(200)
          .json(
            resFormatter(
              true,
              ['Lowest prices fetched successfully'],
              fetchedPrices
            )
          );
      } catch (err) {
        // Pass errors to middlewares.errorHandler
        next(err);
      }
    }
  );

  // GET /api/v1/items/:id
  // Used to find a specific item
  route.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const itemId = parseInt(req.params.id, 10);
      console.log(`GET /api/v1/items/:id Request param: ${itemId}`);

      const fetchedItem = await getItemById(itemId);
      // console.log(fetchedItem);

      res
        .status(200)
        .json(resFormatter(true, ['Item fetched successfully'], fetchedItem));
    } catch (err) {
      // Pass errors to middlewares.errorHandler
      next(err);
    }
  });
}

export default itemRoute;
