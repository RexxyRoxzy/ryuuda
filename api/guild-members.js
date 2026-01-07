// api/guild-members.js - For active member counts
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { guildId } = req.query;
  
  if (!guildId) {
    return res.status(400).json({ error: 'Missing guildId' });
  }

  // Mock data for now
  const mockData = {
    total: Math.floor(Math.random() * 200) + 50,
    online: Math.floor(Math.random() * 80) + 10,
    idle: Math.floor(Math.random() * 20) + 5,
    dnd: Math.floor(Math.random() * 15) + 2,
    offline: Math.floor(Math.random() * 150) + 30,
    bots: Math.floor(Math.random() * 20) + 3,
    roles: [
      { name: 'Admin', count: Math.floor(Math.random() * 5) + 1, color: '#ff3b1a' },
      { name: 'Moderator', count: Math.floor(Math.random() * 10) + 3, color: '#5865F2' },
      { name: 'Member', count: Math.floor(Math.random() * 100) + 50, color: '#57F287' }
    ]
  };

  return res.status(200).json({
    success: true,
    guildId,
    ...mockData
  });
};
