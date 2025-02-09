import { Application } from 'express';
import expressLoader from './express';
import prismaLoader from './prisma';

export default ({ expressApp }: { expressApp: Application }) => {
  const prismaClient = prismaLoader;
  console.log('Prisma loaded');

  expressLoader({ app: expressApp });
  console.log('Express loaded');
};
