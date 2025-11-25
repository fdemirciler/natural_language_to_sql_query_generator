export const EXAMPLE_QUERIES = [
  "Show me the top 10 most populated cities",
  "What is the capital of France?",
  "Which countries have more than 10 million people?",
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const QUERY_ENDPOINTS = {
  GENERATE_SQL: `${API_BASE_URL}/generate-sql`,
  EXECUTE_SQL: `${API_BASE_URL}/execute-sql`,
};
