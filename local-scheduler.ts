import cron from 'node-cron';
import fetch from 'node-fetch';

// Runs every min
cron.schedule('45 12 * * *', async () => {
  console.log('Triggering /api/automated-syncing');

  try {
    const res = await fetch('http://localhost:3000/api/automated-updatePoints');

    const data = await res.json();
    console.log(`Job completed:`, data);
  } catch (error) {
    console.error('Failed to run scheduled job:', error);
  }
});

// keep process alive 
console.log('Local scheduler is running...');
