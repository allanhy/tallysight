import { GET } from '../../src/app/api/user/getFavoriteTeam/route';
import { POST } from '../../src/app/api/user/postFavoriteTeam/route';
import { NextRequest, NextResponse } from 'next/server';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: any) => ({ 
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

describe('Favorite Team API Routes', () => {
  const { getAuth } = require('@clerk/nextjs/server');
  const { sql } = require('@vercel/postgres');
  const { NextResponse } = require('next/server');
  
  const mockUserId = 'test_123';
  const mockTeam = 'Dallas Cowboys';
  const mockTeamLogo = 'https://example.com/cowboys.png';

  beforeEach(() => {
    jest.clearAllMocks();
    getAuth.mockReturnValue({ userId: mockUserId });
  });

  describe('POST - Update Favorite Team', () => {
    it('successfully updates favorite team to Dallas Cowboys', async () => {
      // Mock successful database update
      sql.mockResolvedValueOnce({}); 
      
      // POST 
      const postReq = new Request('http://localhost:3000/api/user/postFavoriteTeam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          teamName: mockTeam, 
          teamLogo: mockTeamLogo 
        })
      });
      
   
      const postResponse = await POST(postReq as NextRequest);
      const postData = await postResponse.json();
      
      // Verify POST response is successful
      expect(postData.success).toBe(true);
      expect(postData.message).toBe('Favorite team updated successfully');
      
      // Verify SQL update was called with correct params
      expect(sql).toHaveBeenCalledTimes(1);
      
      // Verify SQL update contained the right parts
      const sqlUpdateCall = sql.mock.calls[0][0];
      const sqlUpdateString = typeof sqlUpdateCall === 'string' 
        ? sqlUpdateCall 
        : sqlUpdateCall.join('');
        
      expect(sqlUpdateString).toContain('UPDATE users');
      expect(sqlUpdateString).toContain('SET fav_team');
      expect(sqlUpdateString).toContain('WHERE clerk_id');
      
     
      expect(sql).toHaveBeenCalled();
    });

    it('handles database error when updating favorite team', async () => {
      // Mock database error
      sql.mockRejectedValueOnce(new Error('Database error')); 
      
      // Create POST request
      const postReq = new Request('http://localhost:3000/api/user/postFavoriteTeam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          teamName: mockTeam, 
          teamLogo: mockTeamLogo 
        })
      });
      
      // Mock NextResponse to handle error
      NextResponse.json.mockImplementationOnce((data: any, options: any) => {
        return {
          json: () => Promise.resolve(data),
          status: options?.status || 500
        };
      });
      
      // Call API
      const postResponse = await POST(postReq as NextRequest);
      const postData = await postResponse.json();
      
      // Verify error response
      expect(postData.success).toBe(false);
      expect(postData.error).toBeTruthy();
    });
  });

  describe('GET - Retrieve Favorite Team', () => {
    it('Handles post and get of favorite team "Dallas Cowboys"', async () => {
      // Mock database response
      sql.mockResolvedValueOnce({ 
        rows: [{ 
          fav_team: mockTeam,
          fav_team_logo: mockTeamLogo 
        }]
      });
      
      // GET request
      const getReq = new Request('http://localhost:3000/api/user/getFavoriteTeam');
     
      const getResponse = await GET(getReq as NextRequest);
      const getData = await getResponse.json();
      
      // Verify GET was successful
      expect(getData.success).toBe(true);
      expect(getData.team.fav_team).toBe(mockTeam);
      expect(getData.team.fav_team_logo).toBe(mockTeamLogo);
      
      // Verify SQL select contained the right parts
      const sqlGetCall = sql.mock.calls[0][0];
      const sqlGetString = typeof sqlGetCall === 'string' 
        ? sqlGetCall 
        : sqlGetCall.join('');
        
      expect(sqlGetString).toContain('SELECT');
      expect(sqlGetString).toContain('FROM users');
      expect(sqlGetString).toContain('WHERE clerk_id');
    });

    it('handles case when user has no favorite team', async () => {
      // empty database response
      sql.mockResolvedValueOnce({ rows: [] });
      
      // GET request
      const getReq = new Request('http://localhost:3000/api/user/getFavoriteTeam');
      
    
      const getResponse = await GET(getReq as NextRequest);
      const getData = await getResponse.json();
      
      
      expect(getData.success).toBe(false);
      expect(getData.message).toBeTruthy(); // Should have an error message
    });

    it('handles database error when getting favorite team', async () => {
    
      sql.mockRejectedValueOnce(new Error('Database error')); 
      
      
      const getReq = new Request('http://localhost:3000/api/user/getFavoriteTeam');
      
      // Mock NextResponse to handle error
      NextResponse.json.mockImplementationOnce((data: any, options: any) => {
        return {
          json: () => Promise.resolve(data),
          status: options?.status || 500
        };
      });
     
      const getResponse = await GET(getReq as NextRequest);
      const getData = await getResponse.json();
      
      
      expect(getData.success).toBe(false);
      expect(getData.error).toBeTruthy();
    });
  });

  it('Full flow:sets Dallas Cowboys as favorite and then retrieves it', async () => {
    // post
    sql.mockResolvedValueOnce({});
    
    // then get
    sql.mockResolvedValueOnce({ 
      rows: [{ 
        fav_team: mockTeam,
        fav_team_logo: mockTeamLogo 
      }]
    });
    
    // 1. Set favorite team
    const postReq = new Request('http://localhost:3000/api/user/postFavoriteTeam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        teamName: mockTeam, 
        teamLogo: mockTeamLogo 
      })
    });
    
    await POST(postReq as NextRequest);
    
    // 2. Retrieve favorite team
    const getReq = new Request('http://localhost:3000/api/user/getFavoriteTeam');
    const getResponse = await GET(getReq as NextRequest);
    const getData = await getResponse.json();
    
    // 3. Verify full flow works
    expect(getData.success).toBe(true);
    expect(getData.team.fav_team).toBe(mockTeam);
    expect(getData.team.fav_team_logo).toBe(mockTeamLogo);
    expect(sql).toHaveBeenCalledTimes(2);
  });
}); 