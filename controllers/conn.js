import pkg from 'pg';
const { Pool } = pkg;

let pool;

export async function connectToDb() {
    if (process.env.PG_URI) {
        pool = new Pool({
            connectionString: process.env.PG_URI,
            ssl: { rejectUnauthorized: false },
        });
    } else {
        pool = new Pool({
            host: process.env.PG_HOST,
            port: process.env.PG_PORT || 5432,
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            database: process.env.PG_DATABASE,
            ssl: { rejectUnauthorized: false },
        });
    }

    try {
        await pool.query('SELECT NOW()');
        console.log('✅ Connected to Postgres');
    } catch (err) {
        console.error('❌ Failed to connect to Postgres:', err);
        throw err;
    }
}

export function getDb() {
    if (!pool) throw new Error('DB not initialized. Call connectToDb() first.');
    return pool;
}
