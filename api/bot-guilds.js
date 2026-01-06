// api/bot-guilds.js
export default async function handler(req, res) {
  // Allow website to call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    
    if (!BOT_TOKEN) {
      return res.status(200).json({ 
        error: 'Bot token not set in Vercel',
        guilds: [],
        total: 0
      });
    }
    
    // Get bot's guilds from Discord
    const response = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        'Authorization': `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return res.status(200).json({ 
        guilds: [],
        total: 0,
        error: 'Discord API error'
      });
    }
    
    const botGuilds = await response.json();
    const guildIds = botGuilds.map(guild => guild.id);
    
    return res.status(200).json({ 
      guilds: guildIds,
      total: guildIds.length
    });
    
  } catch (error) {
    return res.status(200).json({ 
      error: error.message,
      guilds: [],
      total: 0
    });
  }
}
