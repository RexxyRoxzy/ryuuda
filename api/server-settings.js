// api/server-settings.js - AVEC DATABASE_URL
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { guildId } = req.query;

  if (!guildId) {
    return res.status(400).json({ error: 'Missing guildId' });
  }

  try {
    if (req.method === 'GET') {
      // Récupère depuis la base de données
      let settings = await prisma.serverSettings.findUnique({
        where: { guildId }
      });

      // Crée si n'existe pas
      if (!settings) {
        settings = await prisma.serverSettings.create({
          data: {
            guildId,
            welcomeEnabled: false,
            welcomeChannel: '',
            welcomeMessage: 'Bienvenue {user} dans {server}!',
            loggingEnabled: false,
            loggingChannel: '',
            moderationEnabled: false,
            autoMod: false
          }
        });
      }

      return res.status(200).json({
        success: true,
        guildId,
        welcome: {
          enabled: settings.welcomeEnabled,
          channel: settings.welcomeChannel,
          message: settings.welcomeMessage
        },
        logging: {
          enabled: settings.loggingEnabled,
          channel: settings.loggingChannel
        },
        moderation: {
          enabled: settings.moderationEnabled,
          autoMod: settings.autoMod
        }
      });
    }

    if (req.method === 'POST') {
      const body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(JSON.parse(data)));
        req.on('error', reject);
      });

      console.log('Saving settings to database:', body);

      // Sauvegarde dans la base
      const settings = await prisma.serverSettings.upsert({
        where: { guildId },
        update: {
          welcomeEnabled: body.welcome?.enabled || false,
          welcomeChannel: body.welcome?.channel || '',
          welcomeMessage: body.welcome?.message || 'Bienvenue {user} dans {server}!',
          loggingEnabled: body.logging?.enabled || false,
          loggingChannel: body.logging?.channel || '',
          moderationEnabled: body.moderation?.enabled || false,
          autoMod: body.moderation?.autoMod || false
        },
        create: {
          guildId,
          welcomeEnabled: body.welcome?.enabled || false,
          welcomeChannel: body.welcome?.channel || '',
          welcomeMessage: body.welcome?.message || 'Bienvenue {user} dans {server}!',
          loggingEnabled: body.logging?.enabled || false,
          loggingChannel: body.logging?.channel || '',
          moderationEnabled: body.moderation?.enabled || false,
          autoMod: body.moderation?.autoMod || false
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Paramètres sauvegardés dans la base de données!',
        settings
      });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Erreur base de données',
      details: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
};
