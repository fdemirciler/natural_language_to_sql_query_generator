export default async function handler(req, res) {
    try {
      // Simple test query that should work on any database
      const testQuery = "select count (*) from city";
      
      // Get the current domain (works in both dev and production)
      const baseUrl = req.headers.host?.includes('localhost') 
        ? `http://${req.headers.host}`
        : `https://${req.headers.host}`;
      
      console.log('Keepalive: Pinging database at', new Date().toISOString());
      
      // Call your SQL execution endpoint
      // Replace 'execute-sql' with your actual endpoint name
      const response = await fetch(`${baseUrl}/api/execute-sql`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Vercel-Cron-Keepalive'
        },
        body: JSON.stringify({ 
          sqlQuery: testQuery  // Note: using 'sqlQuery' as your endpoint expects
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      console.log('Keepalive: Database ping successful', result);
      
      res.status(200).json({ 
        success: true, 
        timestamp: new Date().toISOString(),
        message: "Supabase database pinged successfully",
        query: testQuery,
        result: result 
      });
      
    } catch (error) {
      console.error('Keepalive error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }