import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schemas'

const env = dotenv.config({ path: '../.env' });
dotenvExpand.expand(env);

const database = process.env.DB_NAME as string;
const user = process.env.DB_USER as string;
const password = process.env.DB_PASSWORD as string;
const port = Number(process.env.DB_PORT as string);
const host = process.env.POSTGRES_DATABASE_HOST as string;
const ssl = process.env.ENABLE_POSTGRES_SSL_MODE === 'true';

const dbConfig = {
    host,
    database,
    user,
    password,
    port,
    ssl,
};

const enableLogger = process.env.ENABLE_DB_LOGGER === 'true';

export const pool = new Pool(dbConfig);

const db = drizzle(pool, { schema, logger: enableLogger });

export type DbClient = typeof db;

export default db;