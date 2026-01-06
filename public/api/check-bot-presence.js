// /api/check-bot-presence.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { guildId } = req.query;
  
  if (!guildId) {
    return res.status(400).json({ error: 'Missing guildId parameter' });
  }
  
  try {
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    
    // Fetch guild members to check if bot is in guild
    const response = await fetch(`https://discord.com/api/guilds/${guildId}/members?limit=1`, {
      headers: {
        'Authorization': `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    // If status is 200, bot is in guild (has access)
    // If status is 404/403, bot is not in guild or no permission
    const botPresent = response.ok;
    
    return res.status(200).json({ 
      botPresent,
      guildId,
      checkedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error checking bot presence:', error);
    return res.status(200).json({ 
      botPresent: false,
      error: 'Could not verify bot presence',
      guildId 
    });
  }
}
