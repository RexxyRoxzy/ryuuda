// This is what your dashboard is calling
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { guildId } = req.query;
  
  console.log(`[API] server-settings called for guild: ${guildId}, method: ${req.method}`);
  
  if (req.method === 'GET') {
    // Your dashboard expects this exact structure:
    return res.status(200).json({
      success: true,
      guildId: guildId,
      welcome: {
        enabled: false,
        channel: '',
        message: 'Welcome {user} to {server}!'
      },
      logging: {
        enabled: false,
        channel: ''
      },
      moderation: {
        enabled: true,
        autoMod: false
      },
      members: {
        total: 156,
        online: 42,
        bots: 8,
        onlinePercent: 26.9
      }
    });
  }
  
  if (req.method === 'POST') {
    // Log what your dashboard is sending
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('[API] Received settings:', body);
      // Always return success
      return res.status(200).json({
        success: true,
        message: 'Settings saved successfully!'
      });
    });
    
    return;
  }
  
  return res.status(404).json({ error: 'Not found' });
};
