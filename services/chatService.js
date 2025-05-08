import { TogetherAIService } from './togetherAIService.js';
import { MCPService } from './mcpService.js';

export class ChatService {
  constructor() {
    this.togetherAI = new TogetherAIService();
    this.mcpService = new MCPService();
    this.schema = null;
  }

  async initialize() {
    try {
      await this.mcpService.startMCPServer();
      // Fetch the actual schema from the database
      this.schema = await this.mcpService.getSchema();
      console.log('Initialized with schema:', this.schema);
    } catch (error) {
      console.error('Failed to initialize chat service:', error);
      throw error;
    }
  }

  async generateAndExecuteQuery(userInput) {
    try {
      if (!this.schema) {
        // Ensure we have the schema
        this.schema = await this.mcpService.getSchema();
      }

      // Generate SQL query using TogetherAI
      const sqlQuery = await this.togetherAI.generateSQLQuery(userInput, this.schema);

      // Execute the query using MCP service
      const results = await this.mcpService.executeQuery(sqlQuery);

      return {
        query: sqlQuery,
        results: results
      };
    } catch (error) {
      console.error('Error in chat service:', error);
      throw error;
    }
  }

  async cleanup() {
    await this.mcpService.stopMCPServer();
  }
}