import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Debug output for environment variables
  console.log(
    'SUPABASE_SERVICE_ROLE_KEY loaded:',
    !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 8) + '...' : ''
  );
  console.log(
    'NEXT_PUBLIC_SUPABASE_URL loaded:',
    !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL : ''
  );
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sqlQuery } = req.body;
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Execute the SQL query
    const { data, error } = await supabase.rpc('execute_sql', { 
      query: sqlQuery 
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return res.status(200).json({ results: data });
  } catch (error) {
    console.error('Error executing SQL:', error);
    return res.status(500).json({ error: error.message });
  }
}
