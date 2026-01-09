// /api/bot-guilds.js
export default async function handler(req, res) {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    if (!botToken) {
      console.error('DISCORD_BOT_TOKEN is not set');
      return res.status(500).json({ 
        success: false, 
        error: 'Bot token not configured',
        guilds: [] 
      });
    }

    // Fetch bot's guilds from Discord API
    const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord API error:', response.status, errorText);
      
      // Return empty array but still in correct format
      return res.status(200).json({ 
        success: false,
        error: 'Failed to fetch from Discord API',
        guilds: [] 
      });
    }

    const guilds = await response.json();
    
    // Return in the EXACT format frontend expects
    return res.status(200).json({
      guilds: guilds.map(guild => guild.id) // Frontend expects array of guild IDs
    });
    
  } catch (error) {
    console.error('Bot guilds error:', error);
    
    // Still return the correct format even on error
    return res.status(200).json({ 
      guilds: [] 
    });
  }
}
