import { Router } from 'express';
import user from './routes/user';
import item from './routes/item';
import category from './routes/category';

export default () => {
  const app = Router();
  user(app);
  item(app);
  category(app);

  return app;
};
