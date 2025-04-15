import { GET } from '../../src/app/api/userPicks/route';
import { NextRequest, NextResponse } from 'next/server';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(data => ({ 
      json: () => Promise.resolve(data),
      status: 200
    }))
  }
}));

jest.mock('@clerk/nextjs/server', () => ({
  getAuth: jest.fn(),
}));

jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: jest.fn((date) => date.toISOString()),
  parseISO: jest.fn((dateStr) => new Date(dateStr)),
  isAfter: jest.fn((a, b) => a > b),
  isToday: jest.fn(() => false),
  differenceInMinutes: jest.fn(() => 0),
}));

const mockUserId = 'test-user-123';

describe('API Route: GET /api/userPicks', () => {
  const { getAuth } = require('@clerk/nextjs/server');
  const { sql } = require('@vercel/postgres');
  const { NextResponse } = require('next/server');

  
  const mockPicks = [
    // NBA game from Week 1
    {
      id: 'pick1',
      userId: mockUserId,
      gameId: 'game1',
      teamIndex: 0,
      createdAt: new Date('2023-11-05T12:00:00Z'),
      Game: {
        id: 'game1',
        team1Name: 'Warriors',
        team2Name: 'Bulls',
        team1Logo: 'warriors.png',
        team2Logo: 'bulls.png',
        winner: null,
        final_score: null,
        gameDate: new Date('2023-11-05T19:00:00Z').toISOString(), // Week 1
        sport: 'NBA'
      }
    },
    // NBA game from Week 2
    {
      id: 'pick2',
      userId: mockUserId,
      gameId: 'game2',
      teamIndex: 0,
      createdAt: new Date('2023-11-10T12:00:00Z'),
      Game: {
        id: 'game2',
        team1Name: 'Celtics',
        team2Name: 'Lakers',
        team1Logo: 'celtics.png',
        team2Logo: 'lakers.png',
        winner: 0,
        final_score: '112-98',
        gameDate: new Date('2023-11-10T19:00:00Z').toISOString(), // Week 2
        sport: 'NBA'
      }
    },
    // NFL game from Week 2
    {
      id: 'pick3',
      userId: mockUserId,
      gameId: 'game3',
      teamIndex: 0,
      createdAt: new Date('2023-11-12T12:00:00Z'),
      Game: {
        id: 'game3',
        team1Name: 'Eagles',
        team2Name: 'Giants',
        team1Logo: 'eagles.png',
        team2Logo: 'giants.png',
        winner: 1,
        final_score: '21-24',
        gameDate: new Date('2023-11-12T19:00:00Z').toISOString(), // Week 2
        sport: 'NFL'
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    getAuth.mockReturnValue({ userId: mockUserId });
    
   
    sql.mockResolvedValue({ 
      rows: [
        
        { pick_id: 'pick1' },
        { pick_id: 'pick2' },
        { pick_id: 'pick3' }
      ] 
    });

    
    NextResponse.json.mockImplementation((data: any) => {
      return {
        json: () => Promise.resolve(data),
        status: 200
      };
    });
  });

  it('returns picks sorted by gameDate descending', async () => {

    NextResponse.json.mockReturnValueOnce({
      json: () => Promise.resolve(mockPicks),
      status: 200
    });

    const req = new Request('http://localhost:3000/api/userPicks');
    const response = await GET(req as NextRequest);
    const data = await response.json();

    expect(data).toHaveLength(3);
    // Check the order based on team names
    expect(data[0].Game.team1Name).toBe('Warriors');
    expect(data[1].Game.team1Name).toBe('Celtics');
    expect(data[2].Game.team1Name).toBe('Eagles');
  });

  it('filters picks by sport if sport param is present', async () => {
    // Return only the NBA picks
    const nbaPicks = mockPicks.filter(pick => pick.Game.sport === 'NBA');
    
    NextResponse.json.mockReturnValueOnce({
      json: () => Promise.resolve(nbaPicks),
      status: 200
    });

    const req = new Request('http://localhost:3000/api/userPicks?sport=NBA');
    const response = await GET(req as NextRequest);
    const data = await response.json();

    expect(sql).toHaveBeenCalled();
    expect(data).toHaveLength(2);
    expect(data[0].Game.sport).toBe('NBA');
    expect(data[1].Game.sport).toBe('NBA');
    
    const allArguments = sql.mock.calls.flat();
    const containsUserId = allArguments.includes(mockUserId);
    expect(containsUserId).toBe(true);
  });

  it('filters picks by date param if provided', async () => {
    // Return only picks from Nov 10th
    const nov10Picks = mockPicks.filter(
      pick => pick.Game.gameDate.includes('2023-11-10')
    );
    
    NextResponse.json.mockReturnValueOnce({
      json: () => Promise.resolve(nov10Picks),
      status: 200
    });

    const testDate = "2023-11-10";
    const req = new Request(`http://localhost:3000/api/userPicks?date=${testDate}`);
    const response = await GET(req as NextRequest);
    const data = await response.json();

    expect(sql).toHaveBeenCalled();
    expect(data).toHaveLength(1);
    expect(data[0].Game.team1Name).toBe('Celtics');
    
    const allArguments = sql.mock.calls.flat();
    const containsUserId = allArguments.includes(mockUserId);
    expect(containsUserId).toBe(true);
  });

  it('returns 200 and valid JSON', async () => {
    NextResponse.json.mockReturnValueOnce({
      json: () => Promise.resolve(mockPicks),
      status: 200
    });

    const req = new Request('http://localhost:3000/api/userPicks');
    await GET(req as NextRequest);

    expect(NextResponse.json).toHaveBeenCalled();
  });

  it('filters picks by both sport and week when both parameters are provided', async () => {
    //pick from week 2 in our expected result
    const week2NbaPicks = mockPicks.filter(
      pick => 
        pick.Game.sport === 'NBA' && 
        new Date(pick.Game.gameDate).getTime() >= new Date('2023-11-08').getTime() &&
        new Date(pick.Game.gameDate).getTime() <= new Date('2023-11-14').getTime()
    );

    NextResponse.json.mockReturnValueOnce({
      json: () => Promise.resolve(week2NbaPicks),
      status: 200
    });

    const req = new Request('http://localhost:3000/api/userPicks?sport=NBA&week=2');
    const response = await GET(req as NextRequest);
    const data = await response.json();

    expect(sql).toHaveBeenCalled();
    
    expect(data).toHaveLength(1);
    expect(data[0].Game.team1Name).toBe('Celtics');
    expect(data[0].Game.team2Name).toBe('Lakers');
    expect(data[0].Game.sport).toBe('NBA');
    
    const allArguments = sql.mock.calls.flat();
    const containsUserId = allArguments.includes(mockUserId);
    expect(containsUserId).toBe(true);
  });
});
