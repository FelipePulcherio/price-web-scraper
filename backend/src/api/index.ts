import { Router } from 'express';
import userRouter from './routes/user';
import itemRouter from './routes/item';
import categoryRouter from './routes/category';
import storeRouter from './routes/store';
import searchRouter from './routes/search';
import authRouter from './routes/auth';
import middlewares from './middlewares';

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
