// Direct API approach instead of using Vercel AI SDK
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

export default async function handler(req, res) {
  // Debug output for environment variable
  console.log('TOGETHER_API_KEY loaded:', !!process.env.TOGETHER_API_KEY, process.env.TOGETHER_API_KEY ? process.env.TOGETHER_API_KEY.slice(0,8) + '...' : '');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;
    
    // Load schema from the request body
    const { schema } = req.body;
    
    // Create a prompt for Together.ai
    const systemPrompt = `You are an expert SQL query generator and database assistant for PostgreSQL databases.
    
Your task is to convert natural language questions into valid SQL queries based on the following database schema:
${JSON.stringify(schema, null, 2)}

Rules:
1. Generate ONLY SELECT statements. Never generate CREATE, DROP, ALTER, INSERT, UPDATE, DELETE, TRUNCATE, or any other DDL/DML queries.
2. If the user asks for anything other than a SELECT statement, reply with: "You can only use SELECT statements. DDL/DML operations are not allowed."
3. If the user asks about the database schema, tables, columns, or data types, DO NOT generate a SQL query. Instead, respond directly using the schema information provided above. When asked to show the schema, present the answer as a Markdown table with columns: Table, Column, Data Type. Do not attempt to query the database.
4. Whenever you write a SQL query that joins two or more tables, always give meaningful aliases to the columns in the SELECT clause (e.g., AS city_name, AS country_name).
5. Generate ONLY the SQL query without any explanation or markdown formatting (unless responding to a schema/table/column info request as above).
6. Use proper PostgreSQL syntax
7. Make sure column and table references are correct
8. Use appropriate joins when needed
9. Keep the query efficient and readable
10. Do not include any comments in the SQL

Example forbidden question:
User: Create a new table for cities
Response: You can only use SELECT statements. DDL/DML operations are not allowed.

Example schema question:
User: What tables are in the database?
Response: The database contains the following tables: city, country, countrylanguage.

User: What columns are in the city table?
Response: The 'city' table has these columns: id (integer), name (text), countrycode (character), district (text), population (integer).

User: Show me the schema.
Response: Here is the schema as a table:

| Table            | Column        | Data Type   |
|------------------|--------------|-------------|
| city             | id           | integer     |
| city             | name         | text        |
| city             | countrycode  | character   |
| city             | district     | text        |
| city             | population   | integer     |
| country          | code         | character   |
| country          | name         | text        |
| country          | continent    | text        |
| country          | region       | text        |
| country          | surfacearea  | real        |
| country          | indepyear    | smallint    |
| country          | population   | integer     |
| country          | lifeexpectancy| real       |
| country          | gnp          | numeric     |
| country          | gnpold       | numeric     |
| country          | localname    | text        |
| country          | governmentform| text       |
| country          | headofstate  | text        |
| country          | capital      | integer     |
| country          | code2        | character   |
| countrylanguage  | countrycode  | character   |
| countrylanguage  | language     | text        |
| countrylanguage  | isofficial   | boolean     |
| countrylanguage  | percentage   | real        |

Example join question:
User: What is the top 10 most crowded cities? Bring city names and country names
Response:
SELECT c.name AS city_name, co.name AS country_name
FROM city c
JOIN country co ON c.countrycode = co.code
ORDER BY c.population DESC
LIMIT 10
`;


    // Verify API key is available
    if (!process.env.TOGETHER_API_KEY) {
      throw new Error('Together API key is not configured');
    }
    
    console.log('Calling Together.ai API...');
    
    // Call Together.ai API directly
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'API request failed';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || 'API request failed';
      } catch (e) {
        errorMessage = errorText || 'API request failed';
      }
      
      console.error('Together API error response:', errorText);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const sqlQuery = data.choices[0].message.content.trim();

    // LLM Output Post-Check: block forbidden SQL
    const forbidden = /\b(create|drop|alter|insert|update|delete|truncate|grant|revoke)\b/i;
    if (forbidden.test(sqlQuery)) {
      return res.status(400).json({ error: 'Only SELECT statements are allowed. DDL/DML operations are not permitted.' });
    }
    
    return res.status(200).json({ sqlQuery });
  } catch (error) {
    console.error('Error generating SQL:', error);
    return res.status(500).json({ error: error.message });
  }
}
