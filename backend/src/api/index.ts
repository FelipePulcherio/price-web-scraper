import { Router } from 'express';
import user from './routes/user';
import item from './routes/item';
import category from './routes/category';
import store from './routes/store';
import search from './routes/search';
import auth from './routes/auth';
import middlewares from './middlewares';

export default () => {
  const app = Router();
  auth(app);
  user(app);
  item(app);
  category(app);
  store(app);
  search(app);

  app.use(middlewares.errorHandler);

  return app;
};
