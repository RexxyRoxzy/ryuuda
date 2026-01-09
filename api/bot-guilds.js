export default async function handler(req, res) {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    if (!botToken) {
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    // Fetch bot's guilds from Discord API
    const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ 
        error: 'Discord API error',
        details: error 
      });
    }

    const guilds = await response.json();
    res.status(200).json(guilds);
    
  } catch (error) {
    console.error('Bot guilds error:', error);
    res.status(500).json({ error: error.message });
  }
}
