import { GET } from '../../src/app/api/leaderboard/get/route';
import { db } from '@vercel/postgres';

jest.mock('@vercel/postgres', () => ({
  db: {
    connect: jest.fn(),
  },
}));

describe('Leaderboard API Performance Test', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    (db.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns leaderboard data successfully with sport and week', async () => {
    const mockRows = [
      {
        leaderboard_id: 1,
        name: 'Top Players',
        sport: 'NBA',
        week: 1,
        description: 'Weekly stats',
        start_date: new Date().toISOString(),
      },
    ];

    mockClient.query.mockResolvedValueOnce({ rows: mockRows });

    const req = new Request('http://localhost/api/leaderboard?sport=NBA&week=1');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ success: true, data: mockRows });
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('FROM leaderboards'), ['NBA', '1']);
  });

  it('returns empty data if no params are provided', async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [] });

    const req = new Request('http://localhost/api/leaderboard'); 
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });
});
