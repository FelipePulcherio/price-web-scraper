import { Router } from 'express';
import user from './routes/user';
import item from './routes/item';

export default () => {
  const app = Router();
  user(app);
  item(app);

  return app;
};
