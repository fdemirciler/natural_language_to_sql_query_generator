export const EXAMPLE_QUERIES = [
  "Show me the top 10 most populated cities",
  "Average country population by continent",
  "Which countries have more than 50 million population?",
  "Show me countries with more than one official language.",
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const QUERY_ENDPOINTS = {
  GENERATE_SQL: `${API_BASE_URL}/generate-sql`,
  EXECUTE_SQL: `${API_BASE_URL}/execute-sql`,
};
