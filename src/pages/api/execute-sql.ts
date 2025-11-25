import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  results?: {
    data: any[];
    rowCount: number;
  };
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sqlQuery } = req.body;

    if (!sqlQuery) {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    // Get the Firebase Functions URL from environment or use deployed endpoint
    const firebaseUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL ||
      'https://europe-west4-nl2sql-query.cloudfunctions.net/executeSql';

    console.log('🔵 [execute-sql] Calling Firebase Functions');
    console.log('   URL:', firebaseUrl);
    console.log('   Query:', sqlQuery.substring(0, 100));

    const response = await fetch(firebaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sqlQuery,
      }),
    });

    console.log('🔵 [execute-sql] Firebase response status:', response.status);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = 'Failed to execute query';

      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error('🔴 [execute-sql] Firebase JSON error:', errorMessage);
      } else {
        const text = await response.text();
        console.error('🔴 [execute-sql] Firebase error (non-JSON):', text.substring(0, 500));
        errorMessage = `Firebase error: ${response.status} ${response.statusText}`;
      }

      return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();
    console.log('✅ [execute-sql] Success, rows returned:', data.results?.data?.length);
    return res.status(200).json({ results: data.results });
  } catch (error: any) {
    console.error('🔴 [execute-sql] Catch error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}