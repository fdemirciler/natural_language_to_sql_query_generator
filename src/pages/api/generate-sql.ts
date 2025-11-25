import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  sqlQuery?: string;
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
    const { question, schema } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Get the Firebase Functions URL from environment or use deployed endpoint
    const firebaseUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL ||
      'https://europe-west4-nl2sql-query.cloudfunctions.net/generateSql';

    console.log('🔵 [generate-sql] Calling Firebase Functions');
    console.log('   URL:', firebaseUrl);
    console.log('   Question:', question);

    const response = await fetch(firebaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        schema,
      }),
    });

    console.log('🔵 [generate-sql] Firebase response status:', response.status);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = 'Failed to generate SQL';

      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error('🔴 [generate-sql] Firebase JSON error:', errorMessage);
      } else {
        const text = await response.text();
        console.error('🔴 [generate-sql] Firebase error (non-JSON):', text.substring(0, 500));
        errorMessage = `Firebase error: ${response.status} ${response.statusText}`;
      }

      return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();
    console.log('✅ [generate-sql] Success:', data.sqlQuery);
    return res.status(200).json({ sqlQuery: data.sqlQuery });
  } catch (error: any) {
    console.error('🔴 [generate-sql] Catch error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
