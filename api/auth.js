// Vercel serverless function for authentication
const jwt = require('jsonwebtoken');

const SECRET_PASSWORD = process.env.PORTFOLIO_PASSWORD || 'mollytea';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, password, token } = req.body;

    if (action === 'login') {
      if (password === SECRET_PASSWORD) {
        const token = jwt.sign(
          { authenticated: true },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.status(200).json({ success: true, token });
      } else {
        return res.status(401).json({ success: false, error: 'Invalid password' });
      }
    }

    if (action === 'verify') {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.authenticated) {
          return res.status(200).json({ success: true, authenticated: true });
        } else {
          return res.status(401).json({ success: false, authenticated: false });
        }
      } catch (error) {
        return res.status(401).json({ success: false, authenticated: false });
      }
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
