# Natural Language to SQL Query Generator

A modern web application that converts natural language questions into SQL queries for the World PostgreSQL database using Together.ai's language models. The application features a clean, intuitive interface with consistent design language throughout.

## Features

- Convert natural language questions to SQL queries using AI
- Edit and format generated SQL queries
- Execute SQL queries against a Supabase PostgreSQL database
- View query results in a clean, tabular format
- Interactive database schema visualization
- Syntax highlighting for SQL with dark mode support
- Responsive design for all devices
- Consistent, modern UI with the Inter font

## Technologies Used

- **Framework**: Next.js (React)
- **UI Library**: Chakra UI with custom theme
- **Styling**: Custom theme with Inter font
- **API Integration**: Vercel AI SDK for Together.ai LLM integration
- **Database**: Supabase PostgreSQL (World database)
- **SQL Formatting**: sql-formatter library
- **Code Highlighting**: react-syntax-highlighter with light/dark themes
- **Deployment**: Vercel

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
│   ├── components/
│   │   ├── ChatInterface.js      # Natural language input component
│   │   ├── ResultsTable.js       # Query results display component
│   │   ├── SchemaVisualizer.js   # Interactive database schema component
│   │   └── SqlDisplay.js         # SQL display and editing component
│   ├── pages/
│   │   ├── api/
│   │   │   ├── generate-sql.js   # API route for SQL generation
│   │   │   └── execute-sql.js    # API route for SQL execution
│   │   ├── _app.js              # Application wrapper with theme
│   │   └── index.js             # Main application page
│   ├── theme.js                 # Custom Chakra UI theme
│   └── utils/
│       └── schema.js            # Schema utility functions
└── .env.local                   # Environment variables (not in repo)
```

## Database Reference

This app uses the ["World" sample database](https://www.postgresql.org/ftp/projects/pgFoundry/dbsamples/world/world-1.0/) from PostgreSQL as its data source.

## Deployment

This application is deployed on Vercel. The live version can be accessed at [sqlquerygenerator.vercel.app](https://sqlquerygenerator.vercel.app).

## Recent Updates

### UI Improvements
- Implemented Inter font throughout the application with optimized font weights
- Redesigned the Database Schema section with an interactive card-based visualization
- Updated toast notifications to use light pastel blue instead of green
- Fixed dark mode theme consistency and syntax highlighting
- Added rounded corners to all input fields for visual consistency
- Enhanced spacing and padding throughout the interface

### Functional Enhancements
- Added SQL query editing with auto-formatting
- Implemented query persistence between editing and execution
- Created auto-resizing components that adjust based on content
- Improved empty query results feedback with context-specific messages
- Enhanced component data flow for better state management

## License

MIT
