// /api/check-bot-presence.js
export default async function handler(req, res) {
  // Allow website to call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get the guild ID from query parameters
  const { guildId } = req.query;
  
  if (!guildId) {
    return res.status(400).json({ 
      error: 'Missing guildId parameter',
      botPresent: false 
    });
  }
  
  try {
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    
    // Check if bot token is set
    if (!BOT_TOKEN) {
      console.error('DISCORD_BOT_TOKEN is not set in environment variables');
      return res.status(200).json({ 
        botPresent: false,
        error: 'Bot token not configured',
        guildId
      });
    }
    
    console.log(`Checking if bot is in guild: ${guildId}`);
    
    // Method 1: Try to get guild members (most reliable)
    try {
      const response = await fetch(`https://discord.com/api/guilds/${guildId}/members?limit=1`, {
        headers: {
          'Authorization': `Bot ${BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      // If we can get members, bot is in the guild
      const botPresent = response.ok;
      
      return res.status(200).json({ 
        botPresent,
        guildId,
        method: 'guild-members',
        checkedAt: new Date().toISOString()
      });
      
    } catch (membersError) {
      console.log('Guild members method failed, trying guild info...');
      
      // Method 2: Try to get basic guild info
      try {
        const response = await fetch(`https://discord.com/api/guilds/${guildId}`, {
          headers: {
            'Authorization': `Bot ${BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        const botPresent = response.ok;
        
        return res.status(200).json({ 
          botPresent,
          guildId,
          method: 'guild-info',
          checkedAt: new Date().toISOString()
        });
        
      } catch (guildError) {
        // Both methods failed, bot is not in guild
        return res.status(200).json({ 
          botPresent: false,
          guildId,
          method: 'failed-both',
          error: 'Bot not in guild or lacks permissions',
          checkedAt: new Date().toISOString()
        });
      }
    }
    
  } catch (error) {
    console.error('Unexpected error in check-bot-presence:', error);
    return res.status(200).json({ 
      botPresent: false,
      guildId,
      error: error.message,
      checkedAt: new Date().toISOString()
    });
  }
}
