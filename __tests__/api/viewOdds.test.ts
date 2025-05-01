import { GET } from '@/app/api/odds/route';

// Mock fetch globally
global.fetch = jest.fn();

describe('GET /api/odds', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Reset process.env
    process.env.ODDS_API_KEY = 'test-api-key';
  });

  it('should return game data with odds when both APIs are successful', async () => {
    // Mock ESPN API response
    const mockEspnResponse = {
      events: [{
        id: '123',
        date: '2024-03-20T19:00:00Z',
        status: { type: { name: 'Scheduled' } },
        competitions: [{
          venue: { fullName: 'Test Arena' },
          broadcasts: [{ names: ['ESPN'] }],
          competitors: [
            {
              homeAway: 'home',
              team: { displayName: 'Los Angeles Lakers' },
              records: [{ summary: '40-30' }]
            },
            {
              homeAway: 'away',
              team: { displayName: 'Boston Celtics' },
              records: [{ summary: '50-20' }]
            }
          ],
          odds: [{
            spread: 5.5,
            favorite: 'home',
            details: 'LAL -5.5'
          }]
        }]
      }]
    };

    // Mock The Odds API response
    const mockOddsResponse = [{
      id: '123',
      commence_time: '2024-03-20T19:00:00Z',
      home_team: 'Los Angeles Lakers',
      away_team: 'Boston Celtics',
      bookmakers: [{
        markets: [{
          key: 'spreads',
          outcomes: [
            { name: 'Los Angeles Lakers', point: -5.5 },
            { name: 'Boston Celtics', point: 5.5 }
          ]
        }]
      }]
    }];

    // Setup fetch mock responses
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEspnResponse)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOddsResponse)
      }));

    // Create mock request
    const request = new Request('http://localhost:3000/api/odds?gameId=123');

    // Call the route handler
    const response = await GET(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.games).toHaveLength(1);
    expect(data.games[0]).toMatchObject({
      id: '123',
      homeTeam: {
        name: 'Los Angeles Lakers',
        record: '40-30',
        spread: '-5.5'
      },
      awayTeam: {
        name: 'Boston Celtics',
        record: '50-20',
        spread: '+5.5'
      }
    });
  });

  it('should handle missing gameId gracefully', async () => {
    // Mock ESPN API response for multiple days
    const mockEspnResponse = {
      events: [{
        id: '123',
        date: '2024-03-20T19:00:00Z',
        status: { type: { name: 'Scheduled' } },
        competitions: [{
          venue: { fullName: 'Test Arena' },
          broadcasts: [{ names: ['ESPN'] }],
          competitors: [
            {
              homeAway: 'home',
              team: { displayName: 'Los Angeles Lakers' },
              records: [{ summary: '40-30' }]
            },
            {
              homeAway: 'away',
              team: { displayName: 'Boston Celtics' },
              records: [{ summary: '50-20' }]
            }
          ]
        }]
      }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEspnResponse)
    });

    const request = new Request('http://localhost:3000/api/odds?homeTeam=Lakers&awayTeam=Celtics');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.games).toHaveLength(1);
    expect(data.games[0].homeTeam.name).toBe('Los Angeles Lakers');
    expect(data.games[0].awayTeam.name).toBe('Boston Celtics');
  });

  it('should handle ESPN API failure gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('ESPN API Error'));

    const request = new Request('http://localhost:3000/api/odds?gameId=123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to process request');
  });

  it('should handle missing ODDS_API_KEY', async () => {
    // Remove API key
    delete process.env.ODDS_API_KEY;

    const request = new Request('http://localhost:3000/api/odds?gameId=123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.games).toBeDefined();
  });

  it('should handle game over status correctly', async () => {
    const mockEspnResponse = {
      events: [{
        id: '123',
        date: '2024-03-20T19:00:00Z',
        status: { type: { name: 'STATUS_FINAL' } },
        competitions: [{
          venue: { fullName: 'Test Arena' },
          broadcasts: [{ names: ['ESPN'] }],
          competitors: [
            {
              homeAway: 'home',
              team: { displayName: 'Los Angeles Lakers' },
              records: [{ summary: '40-30' }],
              score: 110
            },
            {
              homeAway: 'away',
              team: { displayName: 'Boston Celtics' },
              records: [{ summary: '50-20' }],
              score: 105
            }
          ]
        }]
      }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEspnResponse)
    });

    const request = new Request('http://localhost:3000/api/odds?gameId=123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.games[0].homeTeam.spread).toBe('Game Over');
    expect(data.games[0].awayTeam.spread).toBe('Game Over');
    expect(data.games[0].homeTeam.score).toBe(110);
    expect(data.games[0].awayTeam.score).toBe(105);
  });
});
