// api/server-settings.js
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { guildId } = req.query;
  
  console.log(`API: server-settings pour guild ${guildId}, méthode ${req.method}`);
  
  try {
    if (req.method === 'GET') {
      // Retourne les données que ton dashboard attend
      return res.status(200).json({
        welcome: {
          enabled: true,
          channel: 'général',
          message: 'Bienvenue {user} dans {server}!'
        },
        logging: {
          enabled: false,
          channel: 'logs'
        },
        moderation: {
          enabled: true,
          autoMod: true
        }
      });
    }
    
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        console.log('Settings reçus:', body);
        // Simule un succès
        return res.status(200).json({ 
          success: true, 
          message: 'Paramètres sauvegardés avec succès!'
        });
      });
      
      return;
    }
    
    return res.status(405).json({ error: 'Méthode non autorisée' });
    
  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
};
