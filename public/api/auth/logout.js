import { serialize } from 'cookie';

export default function handler(req, res) {
  const cookie = serialize('discord_user', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: -1, // Expire immediately
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
  res.status(200).json({ success: true });
}
