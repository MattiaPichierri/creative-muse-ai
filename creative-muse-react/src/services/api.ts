import axios from 'axios';
import type { Idea, IdeaRequest, RandomIdeaRequest, IdeaRating, Stats, StreamingData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response) {
      // Server responded with error status
      throw new Error(`API Error: ${error.response.status} - ${error.response.data?.detail || error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network Error: Unable to connect to the server');
    } else {
      // Something else happened
      throw new Error(`Request Error: ${error.message}`);
    }
  }
);

export const ideaService = {
  // Generate a new idea
  async generateIdea(request: IdeaRequest): Promise<Idea> {
    const response = await api.post<Idea>('/generate', request);
    return response.data;
  },

  // Generate idea with streaming (for typing animation)
  async generateIdeaStream(request: IdeaRequest): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${API_BASE_URL}/generate/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body available for streaming');
    }

    return response.body;
  },

  // Generate random idea
  async generateRandomIdea(request: RandomIdeaRequest): Promise<Idea> {
    const response = await api.post<Idea>('/random', request);
    return response.data;
  },

  // Get all ideas
  async getIdeas(limit: number = 50, category?: string): Promise<Idea[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (category) {
      params.append('category', category);
    }

    const response = await api.get<Idea[]>(`/ideas?${params.toString()}`);
    return response.data;
  },

  // Rate an idea
  async rateIdea(ideaId: string, rating: IdeaRating): Promise<{ message: string; rating: number }> {
    const response = await api.put<{ message: string; rating: number }>(`/ideas/${ideaId}/rating`, rating);
    return response.data;
  },

  // Get statistics
  async getStats(): Promise<Stats> {
    const response = await api.get<Stats>('/stats');
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<{ status: string; llm_status: string; database: string }> {
    const healthUrl = API_BASE_URL.replace('/api/v1', '/health');
    const response = await api.get<{ status: string; llm_status: string; database: string }>(healthUrl);
    return response.data;
  },
};

// Streaming helper for parsing Server-Sent Events
export class StreamingParser {
  private decoder = new TextDecoder();
  private buffer = '';

  parseChunk(chunk: Uint8Array): StreamingData[] {
    const text = this.decoder.decode(chunk, { stream: true });
    this.buffer += text;

    const events: StreamingData[] = [];
    const lines = this.buffer.split('\n');
    
    // Keep the last incomplete line in buffer
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          events.push(data);
        } catch (error) {
          console.warn('Failed to parse streaming data:', error);
        }
      }
    }

    return events;
  }

  reset() {
    this.buffer = '';
  }
}

// Export utility functions
export const exportIdeas = (ideas: Idea[], format: 'json' | 'markdown' = 'json'): void => {
  if (ideas.length === 0) {
    throw new Error('No ideas to export');
  }

  const timestamp = new Date().toISOString().split('T')[0];
  let content: string;
  let filename: string;
  let mimeType: string;

  if (format === 'json') {
    content = JSON.stringify(ideas, null, 2);
    filename = `creative-muse-ideas-${timestamp}.json`;
    mimeType = 'application/json';
  } else {
    const markdownContent = ideas.map(idea => {
      const rating = '⭐'.repeat(idea.rating || 0);
      return `## ${idea.title}\n\n**Category:** ${idea.category}\n**Rating:** ${rating}\n**Method:** ${idea.generation_method}\n\n${idea.content}\n\n---\n`;
    }).join('\n');

    content = `# Creative Muse AI - Generated Ideas\n\n*Exported on ${new Date().toLocaleDateString()}*\n\n${markdownContent}`;
    filename = `creative-muse-ideas-${timestamp}.md`;
    mimeType = 'text/markdown';
  }

  // Create and trigger download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Local storage utilities
export const localStorageService = {
  saveIdeas(ideas: Idea[]): void {
    localStorage.setItem('creative-muse-ideas', JSON.stringify(ideas));
  },

  loadIdeas(): Idea[] {
    const saved = localStorage.getItem('creative-muse-ideas');
    return saved ? JSON.parse(saved) : [];
  },

  clearIdeas(): void {
    localStorage.removeItem('creative-muse-ideas');
  },

  saveSettings(settings: { language: string; darkMode: boolean }): void {
    localStorage.setItem('creative-muse-settings', JSON.stringify(settings));
  },

  loadSettings(): { language: string; darkMode: boolean } | null {
    const saved = localStorage.getItem('creative-muse-settings');
    return saved ? JSON.parse(saved) : null;
  },
};

export default api;