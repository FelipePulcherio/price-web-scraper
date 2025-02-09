import { Router } from 'express';
import user from './routes/user';
import item from './routes/item';
import category from './routes/category';
import store from './routes/store';

export default () => {
  const app = Router();
  user(app);
  item(app);
  category(app);
  store(app);

  return app;
};
