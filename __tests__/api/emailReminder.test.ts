import { GET } from '../../src/app/api/send-pick-reminders/route';
import { NextRequest } from 'next/server';
import sgMail from '@sendgrid/mail';
import { Pool } from 'pg';

// Mock modules
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

// Create a mock query function that we can control
const mockQuery = jest.fn();
const mockRelease = jest.fn();

jest.mock('pg', () => {
  return {
    Pool: jest.fn(() => ({
      connect: () => Promise.resolve({
        query: mockQuery,
        release: mockRelease,
      }),
    })),
  };
});

describe('Email Reminder System', () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock Clerk API
    mockFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 'user1',
            email_addresses: [{ email_address: 'test@example.com' }],
            first_name: 'Test',
          },
        ]),
      } as Response)
    );

    // Mock environment variables
    process.env.SENDGRID_API_KEY = 'test-key';
    process.env.SENDGRID_TEMPLATE_ID = 'test-template';
    process.env.CLERK_SECRET_KEY = 'test-clerk-key';
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it('should handle no games for today', async () => {
    // Mock: No games found
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const req = new NextRequest('http://localhost:3000/api/send-pick-reminders');
    const response = await GET(req);
    const data = await response.json();

    expect(data.message).toBe('No games today.');
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockRelease).toHaveBeenCalled();
    expect(sgMail.send).not.toHaveBeenCalled();
  });

  it('should send reminder emails for upcoming games', async () => {
    const now = new Date();
    const gameTime = new Date(now.getTime() + 90 * 60 * 1000)
      .toLocaleTimeString('en-US', { hour12: false });

    // Mock: Games found
    mockQuery
      // First query: Get games
      .mockResolvedValueOnce({
        rows: [{
          id: 'game1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          gameTime,
        }],
      })
      // Second query: Get picks
      .mockResolvedValueOnce({
        rows: [], // No picks made yet
      });

    // Mock SendGrid success
    (sgMail.send as jest.Mock).mockResolvedValueOnce({});

    const req = new NextRequest('http://localhost:3000/api/send-pick-reminders');
    const response = await GET(req);
    const data = await response.json();

    expect(data.message).toContain('reminder email');
    expect(sgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        templateId: 'test-template',
      })
    );
  });

  it('should handle Clerk API errors', async () => {
    // Mock: Games exist but Clerk API fails
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'game1',
        team1Name: 'Team A',
        team2Name: 'Team B',
        gameTime: '14:00:00',
      }],
    });

    // Mock Clerk API error
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('API Error'),
      } as Response)
    );

    const req = new NextRequest('http://localhost:3000/api/send-pick-reminders');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch users from Clerk');
    expect(sgMail.send).not.toHaveBeenCalled();
  });

  it('should handle SendGrid errors gracefully', async () => {
    const now = new Date();
    const gameTime = new Date(now.getTime() + 90 * 60 * 1000)
      .toLocaleTimeString('en-US', { hour12: false });

    // Mock: Games found
    mockQuery
      .mockResolvedValueOnce({
        rows: [{
          id: 'game1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          gameTime,
        }],
      })
      .mockResolvedValueOnce({
        rows: [], // No picks
      });

    // Mock SendGrid error
    (sgMail.send as jest.Mock).mockRejectedValueOnce(new Error('Failed to send'));

    const req = new NextRequest('http://localhost:3000/api/send-pick-reminders');
    const response = await GET(req);
    const data = await response.json();

    // Should still return success but with 0 emails sent
    expect(data.message).toContain('0 reminder email');
  });
}); 