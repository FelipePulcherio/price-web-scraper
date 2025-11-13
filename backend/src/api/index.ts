import { Router } from 'express';
import userRouter from './routes/user.js';
import itemRouter from './routes/item.js';
import categoryRouter from './routes/category.js';
import storeRouter from './routes/store.js';
import searchRouter from './routes/search.js';
import authRouter from './routes/auth.js';
import middlewares from './middlewares/index.js';

export default () => {
  const app = Router();
  authRouter(app);
  userRouter(app);
  itemRouter(app);
  categoryRouter(app);
  storeRouter(app);
  searchRouter(app);
  userRouter(app);

  app.use(middlewares.errorHandler);

  return app;
};
