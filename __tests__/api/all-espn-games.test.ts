import { GET } from '../../src/app/api/all-espn-games/route';
import { NextResponse } from 'next/server';
import { BASE_URLS } from '../../src/app/api/all-espn-games/baseUrls';

// Mock fetch globally
global.fetch = jest.fn();

describe('all-espn-games API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should return 400 for invalid sport', async () => {
    const request = new Request('http://localhost:3000/api/all-espn-games?sport=INVALID');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.games).toEqual([]);
    expect(data.message).toContain('Invalid sport selected');
    // Verify that the invalid sport is not in BASE_URLS
    expect(BASE_URLS['INVALID']).toBeUndefined();
  });

  it('should handle successful NBA games fetch', async () => {
    // Mock successful response
    const mockGamesData = {
      events: [
        {
          id: '123',
          date: '2024-04-12T00:00:00Z',
          competitions: [{
            status: { type: { name: 'STATUS_SCHEDULED' } },
            competitors: [
              {
                homeAway: 'home',
                team: { name: 'Lakers' },
                score: '0'
              },
              {
                homeAway: 'away',
                team: { name: 'Celtics' },
                score: '0'
              }
            ],
            venue: { fullName: 'Staples Center' },
            broadcasts: [{ names: ['ESPN'] }],
            odds: [{
              details: 'LAL -5.5',
              homeTeamOdds: { favorite: true },
              awayTeamOdds: { underdog: true }
            }]
          }]
        }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGamesData)
    });

    const request = new Request('http://localhost:3000/api/all-espn-games?sport=NBA');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.games).toHaveLength(1);
    expect(data.games[0]).toHaveProperty('id', '123');
    expect(data.games[0].homeTeam.name).toBe('Lakers');
    expect(data.games[0].awayTeam.name).toBe('Celtics');
  });

  it('should handle API error response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const request = new Request('http://localhost:3000/api/all-espn-games?sport=NBA');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200); // API returns 200 even for empty results
    expect(data.games).toEqual([]);
    expect(data.message).toContain('No games found');
  });

  it('should handle empty games response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ events: [] })
    });

    const request = new Request('http://localhost:3000/api/all-espn-games?sport=NBA');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.games).toEqual([]);
    expect(data.message).toContain('No games scheduled');
  });

  it('should handle specific date parameter', async () => {
    const mockGamesData = {
      events: [
        {
          id: '123',
          date: '2024-04-12T00:00:00Z',
          competitions: [{
            status: { type: { name: 'STATUS_SCHEDULED' } },
            competitors: [
              {
                homeAway: 'home',
                team: { name: 'Lakers' },
                score: '0'
              },
              {
                homeAway: 'away',
                team: { name: 'Celtics' },
                score: '0'
              }
            ],
            venue: { fullName: 'Staples Center' },
            broadcasts: [{ names: ['ESPN'] }],
            odds: [{
              details: 'LAL -5.5',
              homeTeamOdds: { favorite: true },
              awayTeamOdds: { underdog: true }
            }]
          }]
        }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGamesData)
    });

    const request = new Request('http://localhost:3000/api/all-espn-games?sport=NBA&specificDate=2024-04-12');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.games).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('20240412'),
      expect.any(Object)
    );
  });
}); 