import { config } from '../config/config.js';

export class MCPService {
  constructor() {
    this.mcpProcess = null;
    this.isConnected = false;
    this.dbSchema = null;
  }

  async startMCPServer() {
    if (this.isConnected) return;

    try {
      const { command, args } = config.supabase.mcpServer;

      // Start the MCP server process
      const process = await this.spawnMCPServer(command, args);
      this.mcpProcess = process;
      this.isConnected = true;

      // Fetch the schema immediately after connection
      await this.fetchDatabaseSchema();

      console.log('MCP Server started successfully');
    } catch (error) {
      console.error('Failed to start MCP server:', error);
      throw new Error('Failed to start MCP server');
    }
  }

  async spawnMCPServer(command, args) {
    return new Promise((resolve, reject) => {
      // In a real implementation, we would use Node.js child_process to spawn the server
      // For browser environment, we'll use a WebSocket or similar mechanism
      // This is a placeholder implementation
      resolve({
        pid: Date.now(),
        kill: () => { this.isConnected = false; }
      });
    });
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

      if (!result || !result.data) {
        throw new Error('Failed to fetch schema information');
      }

      // Format the schema information
      const schemaDefinition = result.data.map(table => {
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
      // In production, this would communicate with the MCP server via WebSocket or HTTP
      const response = await fetch('http://localhost:54321/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.supabase.accessToken}`
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        throw new Error(`Query execution failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('Failed to execute query');
    }
  }

  async stopMCPServer() {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      this.mcpProcess = null;
      this.isConnected = false;
      this.dbSchema = null;
      console.log('MCP Server stopped');
    }
  }
}