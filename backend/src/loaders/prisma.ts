import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import config from '../config/index.js';

const adapter = new PrismaNeon({ connectionString: config.postgresUrl });
const prismaLoader = new PrismaClient({ adapter });

export default prismaLoader;
