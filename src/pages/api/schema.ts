import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type ResponseData = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read schema from the public folder
    const schemaPath = path.join(process.cwd(), 'public', 'world_cities_schema.json');
    const schemaData = fs.readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaData);

    return res.status(200).json(schema.tables || []);
  } catch (error: any) {
    console.error('Error in schema API route:', error);
    return res.status(500).json({ error: error.message || 'Failed to load schema' });
  }
}
