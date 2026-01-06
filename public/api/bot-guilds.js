// /api/bot-guilds.js - Gets ALL guilds your bot is in
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
  
  try {
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    
    if (!BOT_TOKEN) {
      return res.status(500).json({ 
        error: 'Bot token not configured in environment variables',
        guilds: [],
        total: 0
      });
    }
    
    // Get all guilds the bot is in
    const response = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        'Authorization': `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Discord API error: ${response.status}`, await response.text());
      return res.status(200).json({ 
        guilds: [],
        total: 0,
        error: 'Failed to fetch from Discord API'
      });
    }
    
    const botGuilds = await response.json();
    
    // Return just the guild IDs
    const guildIds = botGuilds.map(guild => guild.id);
    
    return res.status(200).json({ 
      guilds: guildIds,
      total: guildIds.length,
      fetchedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching bot guilds:', error);
    return res.status(200).json({ 
      error: 'Failed to fetch bot guilds',
      guilds: [],
      total: 0
    });
  }
}
