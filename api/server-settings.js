// /api/server-settings.js
import { Pool } from 'pg';

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { guildId } = req.query;
  
  if (!guildId) {
    return res.status(400).json({ error: 'Missing guildId parameter' });
  }
  
  try {
    if (req.method === 'GET') {
      // Get settings for this guild
      const result = await pool.query(
        'SELECT * FROM server_settings WHERE guild_id = $1',
        [guildId]
      );
      
      if (result.rows.length === 0) {
        // Return default settings if no record exists
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
    
    if (req.method === 'POST') {
      const { setting, value } = req.body;
      
      if (!setting || value === undefined) {
        return res.status(400).json({ error: 'Missing setting or value' });
      }
      
      // First check if record exists
      const checkResult = await pool.query(
        'SELECT * FROM server_settings WHERE guild_id = $1',
        [guildId]
      );
      
      if (checkResult.rows.length === 0) {
        // Create new record with default values
        await pool.query(`
          INSERT INTO server_settings (guild_id, ${setting})
          VALUES ($1, $2)
        `, [guildId, value]);
      } else {
        // Update existing record
        await pool.query(`
          UPDATE server_settings 
          SET ${setting} = $1, updated_at = NOW()
          WHERE guild_id = $2
        `, [value, guildId]);
      }
      
      return res.status(200).json({
        success: true,
        guild_id: guildId,
        setting,
        value,
        updated_at: new Date().toISOString()
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
}
