const { onRequest } = require('firebase-functions/v2/https');
const fetch = require('node-fetch');
const { Client } = require('pg');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const secretManager = new SecretManagerServiceClient();
const projectId = process.env.GCLOUD_PROJECT;

async function accessSecret(secretId) {
  const name = secretManager.secretVersionPath(projectId, secretId, 'latest');
  const [version] = await secretManager.accessSecretVersion({ name });
  return version.payload.data.toString('utf8');
}

exports.generateSql = onRequest(
  { 
    region: 'europe-west4', 
    cors: true,
    invoker: 'public'
  },
  async (req, res) => {

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { question, schema } = req.body;

      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const apiKey = await accessSecret('OPENROUTER_API_KEY');

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

Example join question:
User: What is the top 10 most crowded cities? Bring city names and country names
Response:
SELECT c.name AS city_name, co.name AS country_name
FROM city c
JOIN country co ON c.countrycode = co.code
ORDER BY c.population DESC
LIMIT 10
`;

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };

      if (process.env.OPENROUTER_HTTP_REFERER) {
        headers['HTTP-Referer'] = process.env.OPENROUTER_HTTP_REFERER;
      }

      if (process.env.OPENROUTER_X_TITLE) {
        headers['X-Title'] = process.env.OPENROUTER_X_TITLE;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
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
        console.error('OpenRouter API error:', errorText);
        throw new Error(`LLM API failed with status ${response.status}`);
      }

      const data = await response.json();
      const sqlQuery = data.choices[0].message.content.trim();

      const forbidden = /\b(create|drop|alter|insert|update|delete|truncate|grant|revoke)\b/i;
      if (forbidden.test(sqlQuery)) {
        return res.status(400).json({
          error: 'Only SELECT statements are allowed. DDL/DML operations are not permitted.'
        });
      }

      return res.status(200).json({ sqlQuery });

    } catch (error) {
      console.error('Error in generateSql:', error);
      return res.status(500).json({ error: error.message });
    }
  });

exports.executeSql = onRequest(
  { 
    region: 'europe-west4', 
    cors: true,
    invoker: 'public'
  },
  async (req, res) => {

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sqlQuery } = req.body;
    if (!sqlQuery) {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    let dbClient;

    try {
      const dbUrl = await accessSecret('NEON_DATABASE_URL');

      dbClient = new Client({
        connectionString: dbUrl,
        statement_timeout: 30000
      });

      await dbClient.connect();

      const result = await dbClient.query(sqlQuery);

      return res.status(200).json({
        results: {
          data: result.rows,
          rowCount: result.rowCount
        }
      });

    } catch (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({
        error: `Database execution error: ${error.message}`
      });
    } finally {
      if (dbClient) {
        try {
          await dbClient.end();
        } catch (e) {
          console.warn("Error closing database connection:", e);
        }
      }
    }
  });
