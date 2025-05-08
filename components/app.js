import { ChatService } from '../services/chatService.js';

class App {
  constructor() {
    this.chatService = new ChatService();
    this.initializeElements();
    this.addEventListeners();
    this.initialize();
  }

  async initialize() {
    try {
      await this.chatService.initialize();
      this.addMessage('System is ready. You can start asking questions about the world_cities database.', 'system-message');
    } catch (error) {
      this.addMessage('Failed to initialize the system. Please try refreshing the page.', 'error-message');
    }
  }

  initializeElements() {
    this.chatMessages = document.getElementById('chatMessages');
    this.userInput = document.getElementById('userInput');
    this.sendButton = document.getElementById('sendButton');
    this.sqlQuery = document.getElementById('sqlQuery');
    this.copyButton = document.getElementById('copyButton');
    this.resultsTable = document.getElementById('resultsTable');
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'loading-indicator';
    this.loadingIndicator.textContent = 'Processing...';
  }

  addEventListeners() {
    this.sendButton.addEventListener('click', () => this.handleSend());
    this.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });
    this.copyButton.addEventListener('click', () => this.copyToClipboard());
  }

  async handleSend() {
    const message = this.userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    this.addMessage(message, 'user-message');

    // Clear input and show loading
    this.userInput.value = '';
    this.showLoading(true);

    try {
      const { query, results } = await this.chatService.generateAndExecuteQuery(message);

      // Display the generated SQL
      this.sqlQuery.textContent = query;
      this.addMessage('Generated SQL Query:', 'system-message');
      this.addMessage(query, 'sql-message');

      // Display the results
      this.displayResults(results);
    } catch (error) {
      this.addMessage('Error: ' + error.message, 'error-message');
      this.sqlQuery.textContent = '';
      this.resultsTable.innerHTML = '';
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    if (show) {
      this.sendButton.disabled = true;
      this.chatMessages.appendChild(this.loadingIndicator);
    } else {
      this.sendButton.disabled = false;
      if (this.loadingIndicator.parentNode) {
        this.loadingIndicator.parentNode.removeChild(this.loadingIndicator);
      }
    }
  }

  displayResults(results) {
    if (!results || !results.data || !results.data.length) {
      this.resultsTable.innerHTML = '<p>No results found</p>';
      return;
    }

    const columns = Object.keys(results.data[0]);
    let tableHtml = '<table><thead><tr>';

    // Add headers
    columns.forEach(column => {
      tableHtml += `<th>${column}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    // Add data rows
    results.data.forEach(row => {
      tableHtml += '<tr>';
      columns.forEach(column => {
        tableHtml += `<td>${row[column] ?? ''}</td>`;
      });
      tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';
    this.resultsTable.innerHTML = tableHtml;
    this.addMessage('Query executed successfully!', 'system-message');
  }

  addMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className);
    messageDiv.textContent = text;
    this.chatMessages.appendChild(messageDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  async copyToClipboard() {
    const query = this.sqlQuery.textContent;
    if (!query) return;

    try {
      await navigator.clipboard.writeText(query);
      this.copyButton.textContent = 'Copied!';
      setTimeout(() => {
        this.copyButton.textContent = 'Copy Query';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }
}

// Initialize the app
new App();