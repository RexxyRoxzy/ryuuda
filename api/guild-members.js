// api/guild-members.js
const { getGuildMembers } = require('lib/discord');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { guildId } = req.query;

  if (!guildId) {
    return res.status(400).json({ error: 'Missing guildId' });
  }

  try {
    console.log(`[API] Fetching REAL members for guild: ${guildId}`);
    
    // Essaie d'abord de récupérer les vraies données
    const realMembers = await getGuildMembers(guildId);
    
    return res.status(200).json({
      success: true,
      guildId,
      ...realMembers,
      timestamp: new Date().toISOString(),
      source: 'REAL_DISCORD_API'
    });

  } catch (error) {
    console.error('Failed to get real members, using fallback:', error);
    
    // Fallback si le bot n'a pas accès
    const fallbackData = {
      total: 'FAILED TO FETCH',
      online: 'FAILED TO FETCH',
      idle: 'FAILED TO FETCH',
      dnd: 'FAILED TO FETCH',
      offline: 'FAILED TO FETCH',
      bots: 'FAILED TO FETCH',
      source: 'FALLBACK_DATA'
    };
    
    return res.status(200).json({
      success: true,
      guildId,
      ...fallbackData,
      warning: 'Using fallback data. Make sure bot has permissions.'
    });
  }
};
