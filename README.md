# SQL Query Generator

A web application that converts natural language questions into SQL queries for a world cities database using Together.ai's language models.

## Features

- Convert natural language questions to SQL queries
- Execute SQL queries against a Supabase database
- View query results in a clean, tabular format
- Syntax highlighting for SQL queries
- Responsive design for mobile and desktop

## Technologies Used

- Next.js (React)
- Chakra UI for styling
- Vercel AI SDK for Together.ai integration
- Supabase for database operations
- Deployed on Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your API keys (copy from `.env.example`)
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

- `TOGETHER_API_KEY`: Your Together.ai API key
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Project Structure

```
sql_query_generator/
├── public/
│   └── world_cities_schema.json  # Database schema definition
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── generate-sql.js   # API route for SQL generation
│   │   │   └── execute-sql.js    # API route for SQL execution
│   │   ├── _app.js              # App configuration with Chakra UI
│   │   └── index.js             # Main application page
│   ├── components/
│   │   ├── ChatInterface.js     # Input for natural language questions
│   │   ├── SqlDisplay.js        # Display for generated SQL queries
│   │   ├── ResultsTable.js      # Display for query results
│   │   └── Header.js            # Application header
│   └── utils/
│       └── schema.js            # Utility for loading schema
└── .env.local                   # Environment variables (not in repo)
```

## Database Reference

This app uses the ["World" sample database](https://www.postgresql.org/ftp/projects/pgFoundry/dbsamples/world/world-1.0/) from PostgreSQL as its data source.

## Deployment

This application is deployed on Vercel. The live version can be accessed at [sql-query-generator.vercel.app](https://sql-query-generator.vercel.app).

## License

MIT
