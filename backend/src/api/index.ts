import { Router } from 'express';
import user from './routes/user';
import item from './routes/item';
import category from './routes/category';
import store from './routes/store';
import search from './routes/search';

export default () => {
  const app = Router();
  user(app);
  item(app);
  category(app);
  store(app);
  search(app);

  return app;
};
