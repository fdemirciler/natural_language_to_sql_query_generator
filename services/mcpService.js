import { config } from '../config/config.js';

export class MCPService {
  constructor() {
    this.isConnected = false;
    this.dbSchema = null;
  }

  async startMCPServer() {
    if (this.isConnected) return;

    try {
      // For direct PostgreSQL connection, we don't need an MCP server
      // Just mark as connected and fetch schema
      this.isConnected = true;

      // Fetch the schema immediately after connection
      await this.fetchDatabaseSchema();

      console.log('Database connection established successfully');
    } catch (error) {
      console.error('Failed to establish database connection:', error);
      throw new Error('Failed to establish database connection');
    }
  }

  async fetchDatabaseSchema() {
    try {
      // Query to get table information
      const schemaQuery = `
        SELECT 
          table_name,
          array_agg(
            column_name || ' ' || 
            data_type || 
            CASE 
              WHEN is_nullable = 'NO' THEN ' NOT NULL'
              ELSE ''
            END ||
            CASE 
              WHEN column_name = (
                SELECT column_name 
                FROM information_schema.table_constraints tc
                JOIN information_schema.constraint_column_usage ccu 
                ON tc.constraint_name = ccu.constraint_name
                WHERE tc.table_name = c.table_name 
                AND tc.constraint_type = 'PRIMARY KEY'
                LIMIT 1
              ) THEN ' PRIMARY KEY'
              ELSE ''
            END
          ORDER BY ordinal_position
          ) as columns
        FROM information_schema.columns c
        WHERE table_schema = 'public'
        GROUP BY table_name;
      `;

      const result = await this.executeQuery(schemaQuery);

      if (!result || !result.length) {
        throw new Error('Failed to fetch schema information');
      }

      // Format the schema information
      const schemaDefinition = result.map(table => {
        return `Table: ${table.table_name}\n  Columns:\n    ${table.columns.join('\n    ')}`;
      }).join('\n\n');

      this.dbSchema = schemaDefinition;
      console.log('Schema fetched successfully:', this.dbSchema);
      return this.dbSchema;
    } catch (error) {
      console.error('Error fetching database schema:', error);
      throw error;
    }
  }

  async getSchema() {
    if (!this.dbSchema) {
      await this.fetchDatabaseSchema();
    }
    return this.dbSchema;
  }

  async executeQuery(sql) {
    if (!this.isConnected) {
      await this.startMCPServer();
    }

    try {
      // Call the API endpoint to execute the query
      const response = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sqlQuery: sql })
      });

      if (!response.ok) {
        throw new Error(`Query execution failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.results.data;
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('Failed to execute query');
    }
  }

  async stopMCPServer() {
    this.isConnected = false;
    this.dbSchema = null;
    console.log('Database connection closed');
  }
}