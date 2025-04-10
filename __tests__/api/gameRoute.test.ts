import { GET } from "../../src/app/api/all-espn-games/route";
import { NextRequest } from 'next/server';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: { status?: number }) => ({
      json: () => Promise.resolve(data),
      status: init?.status ?? 200,
      ...data,
    }),
  },
}));

describe('GET /api/all-espn-games/ (unit tests)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (global as any).fetch;
  });

  it('returns 400 if sport is invalid', async () => {
    const url = new URL('http://localhost/api/sports?sport=invalid');
    const req = { url: url.toString() } as Request;
    const res = await GET(req as NextRequest);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toMatch(/Invalid sport/i);
  });

  it('returns games for valid sport and date', async () => {
    // Mock the ESPN response structure
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          {
            id: 'game123',
            date: new Date().toISOString(),
            competitions: [{
              competitors: [
                { homeAway: 'home', team: { name: 'Lakers' }, score: '102' },
                { homeAway: 'away', team: { name: 'Celtics' }, score: '98' },
              ],
              status: { type: { name: 'STATUS_SCHEDULED' }, period: 1, displayClock: '12:00' },
              odds: [{ details: 'TEAM -3.5', homeTeamOdds: {}, awayTeamOdds: {} }],
              venue: { fullName: 'Staples Center' },
              broadcasts: [{ names: ['ESPN'] }],
            }],
          },
        ],
      }),
    });

    const url = new URL('http://localhost/api/sports?sport=nba&specificDate=2025-04-09');
    const req = { url: url.toString() } as Request;

    const res = await GET(req as NextRequest);

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(Array.isArray(data.games)).toBe(true);
    expect(data.games[0]).toHaveProperty('homeTeam');
    expect(data.games[0].homeTeam.name).toBe('Lakers');
  });

  it('returns empty list if ESPN API returns no events', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ events: [] }),
    });

    const url = new URL('http://localhost/api/sports?sport=nba');
    const req = { url: url.toString() } as Request;
    const res = await GET(req as NextRequest);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.games.length).toBe(0);
    expect(data.message).toMatch(/no games/i);
  });
});
