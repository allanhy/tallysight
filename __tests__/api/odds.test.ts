import { GET } from '../../src/app/api/odds/route';
import { NextResponse } from 'next/server';

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({ 
      json: () => Promise.resolve(data),
      status: 200,
      ...data 
    }))
  }
}));

// Mock fetch
global.fetch = jest.fn();

describe('Odds API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle a specific game request', async () => {
    // Mock the fetch response for ESPN API
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('espn.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            events: [{
              id: 'test-game-id',
              date: '2023-12-01T19:00Z',
              competitions: [{
                competitors: [
                  {
                    homeAway: 'home',
                    team: { displayName: 'Boston Celtics' },
                    records: [{ summary: '15-5' }]
                  },
                  {
                    homeAway: 'away',
                    team: { displayName: 'Los Angeles Lakers' },
                    records: [{ summary: '12-8' }]
                  }
                ],
                venue: { fullName: 'TD Garden' },
                broadcasts: [{ names: ['ESPN'] }]
              }],
              status: { type: { name: 'Scheduled' } }
            }]
          })
        });
      }
      return Promise.resolve({ ok: false });
    });

    // Create a mock request
    const request = new Request(
      'http://localhost:3000/api/odds?homeTeam=Celtics&awayTeam=Lakers'
    );

    // Call the API route
    const response = await GET(request);
    const data = await response.json();

    // Assertions
    expect(NextResponse.json).toHaveBeenCalled();
    expect(data.games).toHaveLength(1);
    expect(data.games[0].homeTeam.name).toBe('Boston Celtics');
    expect(data.games[0].awayTeam.name).toBe('Los Angeles Lakers');
  });

  it('should handle errors gracefully', async () => {
    // Mock fetch to throw an error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    // Create a mock request
    const request = new Request('http://localhost:3000/api/odds?gameId=123');

    // Call the API route
    const response = await GET(request);
    const data = await response.json();

    // Assertions
    expect(NextResponse.json).toHaveBeenCalled();
    expect(data.error).toBeDefined();
  });
}); 