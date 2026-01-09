// lib/discord.js
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

async function fetchDiscordAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`https://discord.com/api/v10${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Discord API fetch error:', error);
    throw error;
  }
}

async function getGuild(guildId) {
  return await fetchDiscordAPI(`/guilds/${guildId}?with_counts=true`);
}

async function getGuildMembers(guildId) {
  const members = await fetchDiscordAPI(`/guilds/${guildId}/members?limit=1000`);
  
  // Analyse les vrais membres
  let total = 0;
  let online = 0;
  let bots = 0;
  
  members.forEach(member => {
    if (member.user.bot) {
      bots++;
    } else {
      total++;
      // Vérifie le statut (simplifié)
      if (member.presence?.status === 'online' || member.presence?.status === 'idle' || member.presence?.status === 'dnd') {
        online++;
      }
    }
  });

  return {
    total: total + bots, // Inclut les bots dans le total
    online,
    bots,
    idle: members.filter(m => m.presence?.status === 'idle').length,
    dnd: members.filter(m => m.presence?.status === 'dnd').length,
    offline: members.filter(m => !m.presence || m.presence.status === 'offline').length,
  };
}

async function getGuildChannels(guildId) {
  return await fetchDiscordAPI(`/guilds/${guildId}/channels`);
}

module.exports = {
  fetchDiscordAPI,
  getGuild,
  getGuildMembers,
  getGuildChannels
};
