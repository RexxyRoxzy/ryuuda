// /api/server-settings-bulk.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { guildId } = req.query;
  
  if (!guildId) {
    return res.status(400).json({ error: 'Missing guildId' });
  }
  
  try {
    if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT * FROM server_settings WHERE guild_id = $1',
        [guildId]
      );
      
      if (result.rows.length === 0) {
        // Create default settings
        await pool.query(`
          INSERT INTO server_settings (guild_id)
          VALUES ($1)
          ON CONFLICT (guild_id) DO NOTHING
        `, [guildId]);
        
        // Return defaults
        return res.status(200).json({
          guild_id: guildId,
          prefix: '!',
          welcome_enabled: true,
          welcome_message: 'Welcome {user} to {server}! 👋',
          economy_enabled: true,
          leveling_enabled: true,
          images_enabled: true,
          mod_spam: true,
          mod_links: true,
          mod_mentions: false,
          is_default: true
        });
      }
      
      return res.status(200).json(result.rows[0]);
    }
    
    if (req.method === 'PUT') {
      const settings = req.body;
      
      // Remove non-setting fields
      delete settings.guild_id;
      delete settings.created_at;
      delete settings.updated_at;
      delete settings.is_default;
      
      // Build SET clause dynamically
      const setClause = Object.keys(settings)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const values = [guildId, ...Object.values(settings)];
      
      const result = await pool.query(`
        INSERT INTO server_settings (guild_id, ${Object.keys(settings).join(', ')})
        VALUES ($1, ${Object.keys(settings).map((_, i) => `$${i + 2}`).join(', ')})
        ON CONFLICT (guild_id) 
        DO UPDATE SET 
          ${setClause},
          updated_at = NOW()
        RETURNING *
      `, values);
      
      return res.status(200).json({
        success: true,
        guild_id: guildId,
        settings: result.rows[0],
        updated_at: new Date().toISOString()
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Bulk settings error:', error);
    return res.status(500).json({ error: error.message });
  }
}
