export default function handler(req, res) {
  const CLIENT_ID = '1456640479201595453';
  const REDIRECT_URI = encodeURIComponent(`${process.env.VERCEL_URL}/api/auth/callback`);
  const SCOPE = encodeURIComponent('identify email');
  
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`;
  
  res.redirect(discordAuthUrl);
}
