import pkg from 'pg';
const { Client } = pkg;

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function testConnection() {
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('✅ Connected to Neon database:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
