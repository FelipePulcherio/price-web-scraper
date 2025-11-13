import { Application } from 'express';
import expressLoader from './express.js';
import prismaLoader from './prisma.js';

export default ({ expressApp }: { expressApp: Application }) => {
  const prismaClient = prismaLoader;
  console.log('Prisma loaded');

  expressLoader({ app: expressApp });
  console.log('Express loaded');
};
