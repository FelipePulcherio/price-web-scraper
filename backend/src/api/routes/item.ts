import { Router, Request, Response } from 'express';
import { getItemById } from '@/database/operations/dbRead';
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
};
