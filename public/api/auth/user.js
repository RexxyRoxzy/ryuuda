import { parse } from 'cookie';

export default function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  
  if (cookies.discord_user) {
    try {
      const userData = JSON.parse(cookies.discord_user);
      res.status(200).json(userData);
    } catch (error) {
      res.status(401).json({ error: 'Invalid session' });
    }
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
}
