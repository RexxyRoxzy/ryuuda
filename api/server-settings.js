// /api/server-settings.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { guildId } = req.query;
  
  if (!guildId) {
    return res.status(400).json({ error: 'Missing guildId' });
  }
  
  if (req.method === 'GET') {
    // Return default settings for now
    return res.status(200).json({
      guildId,
      prefix: '!',
      welcome_enabled: true,
      welcome_message: 'Welcome {user} to {server}! 👋',
      economy_enabled: true,
      leveling_enabled: true,
      updatedAt: new Date().toISOString()
    });
  }
  
  if (req.method === 'POST') {
    // Save settings (you'll connect to database here)
    const { setting, value } = req.body;
    
    return res.status(200).json({
      success: true,
      guildId,
      setting,
      value,
      savedAt: new Date().toISOString(),
      message: 'Settings saved (demo mode - not actually saved to database yet)'
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
