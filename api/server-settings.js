// Vercel serverless function - save this in /api/server-settings.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { guildId } = req.query;

  if (req.method === 'GET') {
    try {
      // In a real app, fetch from database
      // For now, return mock data
      return res.status(200).json({
        guildId,
        welcome: {
          enabled: false,
          channel: '',
          message: 'Welcome {user} to {server}!'
        },
        logging: {
          enabled: false,
          channel: ''
        },
        moderation: {
          enabled: false,
          autoMod: false
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  if (req.method === 'POST') {
    try {
      const settings = req.body;
      
      // In a real app, save to database
      console.log('Saving settings for guild', guildId, settings);
      
      // Simulate successful save
      return res.status(200).json({ 
        success: true, 
        message: 'Settings saved successfully',
        settings 
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
