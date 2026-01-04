const express = require('express');
const axios = require('axios');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Discord OAuth2 credentials
const CLIENT_ID = '1456640479201595453';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
    ? 'https://ryuuda.vercel.app/api/auth/callback' 
    : 'http://localhost:3000/api/auth/callback';
const DISCORD_API_URL = 'https://discord.com/api/v10';

// Routes
app.get('/api/auth/login', (req, res) => {
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify%20email`;
    res.redirect(authUrl);
});

app.get('/api/auth/callback', async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.redirect('/?error=no_code');
        }

        // Exchange code for access token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', 
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, token_type } = tokenResponse.data;

        // Get user data
        const userResponse = await axios.get(`${DISCORD_API_URL}/users/@me`, {
            headers: {
                authorization: `${token_type} ${access_token}`
            }
        });

        // Store user in session
        req.session.user = {
            id: userResponse.data.id,
            username: userResponse.data.username,
            discriminator: userResponse.data.discriminator,
            avatar: userResponse.data.avatar,
            global_name: userResponse.data.global_name,
            email: userResponse.data.email,
            banner: userResponse.data.banner,
            banner_color: userResponse.data.banner_color,
            accent_color: userResponse.data.accent_color,
            avatar_decoration: userResponse.data.avatar_decoration,
            verified: userResponse.data.verified,
            premium_type: userResponse.data.premium_type
        };

        // Redirect to home page
        res.redirect('/');
        
    } catch (error) {
        console.error('Auth error:', error.response?.data || error.message);
        res.redirect('/?error=auth_failed');
    }
});

app.get('/api/auth/user', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

app.get('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true });
    });
});

// Serve main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Discord OAuth configured for: ${REDIRECT_URI}`);
});