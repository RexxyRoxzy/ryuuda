import { getServerSettings, updateServerSettings } from '../../lib/db';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { guildId } = req.query;

  if (!guildId) {
    return res.status(400).json({ error: 'Missing guildId parameter' });
  }

  try {
    if (req.method === 'GET') {
      const settings = await getServerSettings(guildId);
      
      return res.status(200).json({
        success: true,
        guildId,
        welcome: {
          enabled: settings.welcomeEnabled,
          channel: settings.welcomeChannel,
          message: settings.welcomeMessage
        },
        logging: {
          enabled: settings.loggingEnabled,
          channel: settings.loggingChannel
        },
        moderation: {
          enabled: settings.moderationEnabled,
          autoMod: settings.autoMod
        }
      });
    }

    if (req.method === 'POST') {
      const data = req.body;
      
      // Validate input
      if (!data) {
        return res.status(400).json({ error: 'Missing request body' });
      }

      const updatedSettings = await updateServerSettings(guildId, {
        welcomeEnabled: data.welcome?.enabled || false,
        welcomeChannel: data.welcome?.channel || '',
        welcomeMessage: data.welcome?.message || 'Welcome {user} to {server}!',
        loggingEnabled: data.logging?.enabled || false,
        loggingChannel: data.logging?.channel || '',
        moderationEnabled: data.moderation?.enabled || false,
        autoMod: data.moderation?.autoMod || false
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Settings saved successfully',
        settings: updatedSettings
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
