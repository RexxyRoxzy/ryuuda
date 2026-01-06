// /api/test.js - Simple test to verify API is working
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.status(200).json({ 
    message: 'API is working.',
    endpoint: 'test',
    timestamp: new Date().toISOString(),
    project: 'Ryuuda Dashboard',
    environment: {
      hasBotToken: !!process.env.DISCORD_BOT_TOKEN,
      nodeVersion: process.version,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  });
}
