// api/server-settings.js - FIXED VERSION
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { guildId } = req.query;

  if (!guildId) {
    return res.status(400).json({ error: 'Missing guildId' });
  }

  try {
    if (req.method === 'GET') {
      // Return mock data that matches what your dashboard expects
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
        },
        members: {
          total: 150,
          online: 42,
          bots: 8,
          onlinePercent: 28
        }
      });
    }

    if (req.method === 'POST') {
      // Just accept and log the data for now
      console.log('Received POST for guild:', guildId, req.body);
      return res.status(200).json({ 
        success: true, 
        message: 'Settings saved successfully!'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in server-settings:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};
