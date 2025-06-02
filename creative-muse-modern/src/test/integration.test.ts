/**
 * Creative Muse AI - Integration Tests
 * Test di integrazione per verificare il funzionamento dei componenti frontend
 */

import { apiClient } from '../lib/api-client';

// Mock fetch per i test
global.fetch = jest.fn();

describe('Frontend Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('API Client', () => {
    it('should set and get token correctly', () => {
      const testToken = 'test-token-123';
      apiClient.setToken(testToken);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', testToken);
    });

    it('should handle login request', async () => {
      const mockResponse = {
        token: 'test-token',
        user_id: '1',
        email: 'test@example.com',
        subscription_tier: 'free',
        email_verified: 1,
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiClient.login('test@example.com', 'password');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle registration request', async () => {
      const mockResponse = {
        access_token: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          subscription_tier: 'free',
          email_verified: true,
          is_active: true,
        },
        message: 'Registration successful',
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiClient.register({
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle idea generation request', async () => {
      const mockResponse = {
        id: '1',
        content: 'Test idea content',
        category: 'technology',
        creativity_level: 7,
        model_used: 'mistral-7b-instruct-v0.3',
        created_at: '2025-01-06T15:30:00Z',
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      apiClient.setToken('test-token');
      const result = await apiClient.generateIdea({
        prompt: 'Create an innovative app',
        category: 'technology',
        creativity_level: 7,
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle subscription info request', async () => {
      const mockResponse = {
        tier: 'free',
        limits: {
          daily_ideas: 10,
          monthly_ideas: 100,
          team_members: 1,
          projects: 3,
        },
        usage: {
          daily_ideas: 5,
          monthly_ideas: 25,
        },
        features: {
          ai_models: ['mistral-7b-instruct-v0.3'],
          export_formats: ['txt', 'md'],
          collaboration: false,
          priority_support: false,
          api_access: false,
          white_label: false,
          analytics: false,
        },
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      apiClient.setToken('test-token');
      const result = await apiClient.getSubscriptionInfo();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle admin stats request', async () => {
      const mockResponse = {
        total_users: 150,
        active_users: 120,
        total_ideas_generated: 5000,
        ideas_today: 250,
        system_health: 'healthy',
        api_response_time: 150,
        error_rate: 0.02,
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      apiClient.setToken('admin-token');
      const result = await apiClient.getAdminStats();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle error responses correctly', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Invalid credentials' }),
      } as Response);

      const result = await apiClient.login('wrong@example.com', 'wrongpass');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should handle network errors', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await apiClient.login('test@example.com', 'password');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('Authentication Flow', () => {
    it('should handle complete login flow', async () => {
      // Mock successful login
      const loginResponse = {
        token: 'auth-token-123',
        user_id: '1',
        email: 'user@example.com',
        subscription_tier: 'creator',
        email_verified: 1,
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => loginResponse,
      } as Response);

      const result = await apiClient.login('user@example.com', 'password');
      
      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('auth-token-123');
    });

    it('should handle password reset flow', async () => {
      // Mock forgot password
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Reset email sent' }),
      } as Response);

      const forgotResult = await apiClient.forgotPassword('user@example.com');
      expect(forgotResult.success).toBe(true);

      // Mock reset password
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset successful' }),
      } as Response);

      const resetResult = await apiClient.resetPassword('reset-token', 'newpassword');
      expect(resetResult.success).toBe(true);
    });
  });

  describe('AI Features', () => {
    beforeEach(() => {
      apiClient.setToken('test-token');
    });

    it('should handle batch idea generation', async () => {
      const mockResponse = [
        { id: '1', content: 'Idea 1', category: 'tech' },
        { id: '2', content: 'Idea 2', category: 'business' },
        { id: '3', content: 'Idea 3', category: 'creative' },
      ];

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiClient.generateBatchIdeas(
        ['Prompt 1', 'Prompt 2', 'Prompt 3'],
        { category: 'mixed' }
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('should handle model loading', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'loaded', message: 'Model loaded successfully' }),
      } as Response);

      const result = await apiClient.loadModel('mistral-7b-instruct-v0.3');
      
      expect(result.success).toBe(true);
      expect((result.data as Record<string, unknown>)?.status).toBe('loaded');
    });

    it('should handle idea rating', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Rating saved', average_rating: 4.2 }),
      } as Response);

      const result = await apiClient.rateIdea('idea-123', 5);
      
      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Rating saved');
    });
  });

  describe('Admin Features', () => {
    beforeEach(() => {
      apiClient.setToken('admin-token');
    });

    it('should handle user management', async () => {
      // Mock get all users
      const usersResponse = {
        users: [
          { id: '1', email: 'user1@example.com', is_active: true },
          { id: '2', email: 'user2@example.com', is_active: false },
        ],
        total: 2,
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => usersResponse,
      } as Response);

      const result = await apiClient.getAllUsers(10, 0);
      expect(result.success).toBe(true);
      expect((result.data as unknown as Record<string, unknown>)?.users).toHaveLength(2);

      // Mock suspend user
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'User suspended' }),
      } as Response);

      const suspendResult = await apiClient.suspendUser('1', 'Policy violation');
      expect(suspendResult.success).toBe(true);
    });

    it('should handle feature flags', async () => {
      const flagsResponse = {
        flags: {
          new_ui: true,
          beta_features: false,
          advanced_analytics: true,
        },
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => flagsResponse,
      } as Response);

      const result = await apiClient.getFeatureFlags();
      expect(result.success).toBe(true);
      expect(((result.data as unknown as Record<string, unknown>)?.flags as Record<string, unknown>)?.new_ui).toBe(true);
    });
  });

  describe('Subscription Management', () => {
    beforeEach(() => {
      apiClient.setToken('user-token');
    });

    it('should handle subscription upgrade', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          message: 'Subscription upgraded',
          checkout_url: 'https://checkout.stripe.com/session123'
        }),
      } as Response);

      const result = await apiClient.upgradeSubscription('pro');
      expect(result.success).toBe(true);
      expect(result.data?.checkout_url).toContain('stripe.com');
    });

    it('should handle billing history', async () => {
      const billingResponse = {
        invoices: [
          { id: 'inv_1', amount: 2999, date: '2025-01-01', status: 'paid' },
          { id: 'inv_2', amount: 2999, date: '2024-12-01', status: 'paid' },
        ],
        total: 2,
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => billingResponse,
      } as Response);

      const result = await apiClient.getBillingHistory(10);
      expect(result.success).toBe(true);
      expect((result.data as unknown as Record<string, unknown>)?.invoices).toHaveLength(2);
    });
  });
});