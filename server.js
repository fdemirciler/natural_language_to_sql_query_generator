import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Together.ai API proxy endpoint
app.post('/api/proxy/together', async (req, res) => {
    try {
        console.log('Proxying request to Together.ai:', {
            model: req.body.model,
            messages: req.body.messages
        });

        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${req.headers.authorization}`,
                'Content-Type': 'application/json',
                'Together-Api-Version': '1.0.0'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Together.ai API error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            return res.status(response.status).json({
                error: `Together.ai API error: ${response.status} ${response.statusText}`,
                details: errorText
            });
        }

        const data = await response.json();
        console.log('Together.ai API response:', data);
        res.json(data);
    } catch (error) {
        console.error('Proxy server error:', error);
        res.status(500).json({
            error: 'Proxy server error',
            message: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});