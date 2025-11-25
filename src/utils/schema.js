// This utility will load the schema from the API endpoint
export async function getSchema() {
  try {
    const response = await fetch('/api/schema');
    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.tables || [];
  } catch (error) {
    console.error('Error fetching schema:', error);
    // Fallback to empty array
    return [];
  }
}
