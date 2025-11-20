import { PrismaClient } from '../database/generated/prisma/client.js';
import { PrismaNeon } from '@prisma/adapter-neon';
import config from '../config/index.js';

const adapter = new PrismaNeon({ connectionString: config.postgresUrl });
const prismaLoader = new PrismaClient({ adapter });

export default prismaLoader;
