// This utility will load the schema from a static JSON file
export async function getSchema() {
  try {
    const response = await fetch('/world_cities_schema.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data.tables) ? data.tables : [];
  } catch (error) {
    console.error('Error fetching schema:', error);
    // Fallback to empty array
    return [];
  }
}
