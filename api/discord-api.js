// api/discord-api.js
const { getGuild, getGuildMembers } = require('lib/discord');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { guildId, action } = req.query;

  if (!guildId) {
    return res.status(400).json({ error: 'Missing guildId' });
  }

  try {
    if (action === 'guild') {
      const guild = await getGuild(guildId);
      return res.status(200).json({
        success: true,
        guild: {
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          owner: guild.owner,
          members: guild.approximate_member_count,
          online: guild.approximate_presence_count,
          features: guild.features
        }
      });
    }

    if (action === 'members') {
      const members = await getGuildMembers(guildId);
      return res.status(200).json({
        success: true,
        ...members
      });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Discord API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch from Discord',
      details: error.message 
    });
  }
};
