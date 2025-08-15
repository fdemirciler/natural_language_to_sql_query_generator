import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Debug output for environment variables
  console.log(
    'POSTGRES_URL loaded:',
    !!process.env.POSTGRES_URL,
    process.env.POSTGRES_URL ? process.env.POSTGRES_URL.slice(0, 20) + '...' : ''
  );

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sqlQuery } = req.body;

    if (!sqlQuery) {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    // Execute the SQL query using Vercel Postgres
    const result = await sql.query(sqlQuery);

    return res.status(200).json({
      results: {
        data: result.rows,
        rowCount: result.rowCount
      }
    });
  } catch (error) {
    console.error('Error executing SQL:', error);
    return res.status(500).json({ error: error.message });
  }
}
