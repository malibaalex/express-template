import Util from "@/core/utils/index.js";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client.js";

const { env } = Util;

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

export { prisma };
