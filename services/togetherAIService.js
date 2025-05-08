import { config } from '../config/config.js';

export class TogetherAIService {
    constructor() {
        this.apiKey = config.togetherAI.apiKey;
        this.model = 'togethercomputer/llama-2-70b-chat';
        this.proxyUrl = 'http://localhost:3001/api/proxy/together';
    }

    async generateSQLQuery(userInput, schema) {
        try {
            console.log('Sending request to proxy server...');

            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Authorization': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert SQL engineer. Generate only PostgreSQL queries without any explanations or markdown formatting."
                        },
                        {
                            role: "user",
                            content: `Given this PostgreSQL schema:\n\n${schema}\n\nWrite a query for this request: ${userInput}\n\nReturn ONLY the SQL query, no explanations.`
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000,
                    stop: ["\n\n", "```"]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Proxy server error:', errorData);
                throw new Error(errorData.error || 'Failed to generate SQL query');
            }

            const data = await response.json();
            console.log('Received response:', data);

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response format from API');
            }

            const sqlQuery = data.choices[0].message.content.trim();
            console.log('Generated SQL:', sqlQuery);

            // Clean up any markdown or extra formatting
            return sqlQuery.replace(/```sql\n?|\n?```/g, '').trim();
        } catch (error) {
            console.error('Error in generateSQLQuery:', error);
            throw new Error(`Failed to generate SQL query: ${error.message}`);
        }
    }
}