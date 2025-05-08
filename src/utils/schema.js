// This utility will load the schema from the JSON file
export async function getSchema() {
  const response = await fetch('/world_cities_schema.json');
  const schema = await response.json();
  return schema;
}
