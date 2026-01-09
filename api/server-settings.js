// /api/server-settings.js
export default async function handler(req, res) {
  const { guildId } = req.query;
  
  if (!guildId) {
    return res.status(400).json({ error: 'Missing guildId' });
  }

  // For now, return dummy settings - you can connect to a database later
  if (req.method === 'GET') {
    // Return default settings
    return res.status(200).json({
      welcome: {
        enabled: true,
        channel: null,
        message: "Welcome {user} to {server}!"
      },
      logging: {
        enabled: false,
        channel: null
      },
      moderation: {
        autoMod: true,
        filterLinks: false,
        filterWords: []
      }
    });
  }
  
  // Handle POST (save settings)
  if (req.method === 'POST') {
    try {
      const settings = req.body;
      console.log(`Saving settings for guild ${guildId}:`, settings);
      
      // Here you would save to a database
      // For now, just confirm receipt
      
      return res.status(200).json({
        success: true,
        message: 'Settings saved (demo mode - not persisted)'
      });
    } catch (error) {
      console.error('Save settings error:', error);
      return res.status(500).json({ error: 'Failed to save settings' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
