'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SyncSportsRadarPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [gameIds, setGameIds] = useState<string>('');
  const [autoSync, setAutoSync] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const router = useRouter();

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Parse gameIds from comma-separated string to array (if provided)
      const gameIdsArray = gameIds.trim() ? gameIds.split(',').map(id => id.trim()) : [];
      
      const response = await fetch('/api/admin/syncSportsRadarData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameIds: gameIdsArray
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to sync data');
      }

      setResult(data);
      setLastSyncTime(new Date().toLocaleString());
      router.refresh(); // Refresh the page data if needed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up auto-sync interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoSync) {
      // Run immediately on activation
      handleSync();
      
      // Set interval for every 6 hours (6 * 60 * 60 * 1000 ms)
      intervalId = setInterval(handleSync, 6 * 60 * 60 * 1000);
    }
    
    // Clean up interval on component unmount or when autoSync changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoSync]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Sync SportsRadar Data</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">
            Game IDs (comma-separated, optional):
            <textarea
              value={gameIds}
              onChange={(e) => setGameIds(e.target.value)}
              placeholder="e.g., abc123, def456 (leave empty to sync all available games)"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              rows={3}
            />
          </label>
        </div>
        
        <div className="flex items-center mb-4">
          <label className="flex items-center text-gray-700">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="mr-2"
            />
            Auto-sync every 6 hours
          </label>
          {lastSyncTime && (
            <span className="ml-4 text-sm text-gray-500">
              Last sync: {lastSyncTime}
            </span>
          )}
        </div>
        
        <button
          onClick={handleSync}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Syncing...' : 'Sync SportsRadar Data'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Success</p>
          <p>{result.message || "Data synchronized successfully"}</p>
          
          {result.summary ? (
            <div className="mt-4">
              <h3 className="font-semibold">Summary:</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Total games processed: {result.summary.total || 0}</li>
                <li>Games updated: {result.summary.updated || 0}</li>
                <li>Games not final yet: {result.summary.notFinal || 0}</li>
                <li>Games not found: {result.summary.notFound || 0}</li>
                <li>Games with invalid data: {result.summary.invalidData || 0}</li>
              </ul>
            </div>
          ) : result.results ? (
            <div className="mt-4">
              <h3 className="font-semibold">Results:</h3>
              <p>Total games processed: {result.results.length}</p>
              <ul className="list-disc pl-5 mt-2">
                {result.results.map((item: { espnId: string; status: string; message: string }, index: number) => (
                  <li key={index}>
                    Game {item.espnId}: {item.status} - {item.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-4">
              <p>No detailed information available</p>
            </div>
          )}
          
          <details className="mt-4">
            <summary className="cursor-pointer font-semibold">View Details</summary>
            <pre className="mt-2 bg-gray-100 p-4 rounded-md">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
} 