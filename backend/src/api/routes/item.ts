import { Router, Request, Response } from 'express';
import {
  getItemById,
  getItemsByCategoryId,
  getLowestPricesByItemId,
} from '@/database/operations/dbRead';
import resFormatter from '@/helpers/apiResponseFormatter';

const route = Router();

export default (app: Router) => {
  app.use('/items', route);

  // GET /api/v1/items/:id
  // Used to find a specific item
  route.get('/:id', async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id, 10);
      console.log(`GET /api/v1/items/:id Request param: ${itemId}`);

      const fetchedItem = await getItemById(itemId);
      // console.log(fetchedItem);

      res
        .status(200)
        .json(resFormatter(true, 'Item fetched successfully', fetchedItem));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Uknown error';

      console.error('GET /api/v1/items/:id', errorMessage);

      // Not found
      if (errorMessage.includes('Not found')) {
        res.status(404).json(resFormatter(false, errorMessage, null));
      }
      // Forbidden
      else if (errorMessage.includes('Forbidden')) {
        res.status(403).json(resFormatter(false, errorMessage, null));
      }
      // All other errors
      else {
        res
          .status(500)
          .json(resFormatter(false, 'Internal server error', null));
      }
    }
  });

  // GET /api/v1/items/category/:categoryId?page=
  // Used to find all items that are related to a categoryId
  route.get('/category/:categoryId', async (req: Request, res: Response) => {
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
        .json(resFormatter(true, 'Items fetched successfully', fetchedItems));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Uknown error';

      console.error('GET /api/v1/items/category/:categoryId', errorMessage);

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

  // GET /api/v1/items/history/30/:itemId
  // Used to get last 30 days prices of a specific item
  route.get('/history/30/:itemId', async (req: Request, res: Response) => {
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
            'Lowest prices fetched successfully',
            fetchedPrices
          )
        );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Uknown error';

      console.error('GET /api/v1/items/:id', errorMessage);

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
