import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });