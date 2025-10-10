// Enhanced Vercel serverless function with additional security
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SECRET_PASSWORD = process.env.PORTFOLIO_PASSWORD || 'mollytea';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// In-memory rate limiting (use Redis in production)
const rateLimitStore = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const attempts = rateLimitStore.get(ip) || [];
  const recentAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return false;
  }
  
  return true;
}

function recordAttempt(ip) {
  const now = Date.now();
  const attempts = rateLimitStore.get(ip) || [];
  attempts.push(now);
  
  // Keep only recent attempts
  const recentAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW);
  rateLimitStore.set(ip, recentAttempts);
}

function clearAttempts(ip) {
  rateLimitStore.delete(ip);
}

function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         'unknown';
}

export default async function handler(req, res) {
  const clientIP = getClientIP(req);
  
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
    const { action, password, token, timestamp, userAgent } = req.body;

    // Rate limiting check
    if (action === 'login' && !checkRateLimit(clientIP)) {
      return res.status(429).json({ 
        success: false, 
        error: 'Too many failed attempts. Please try again later.' 
      });
    }

    if (action === 'login') {
      // Additional security checks
      if (!password || typeof password !== 'string') {
        recordAttempt(clientIP);
        return res.status(400).json({ success: false, error: 'Invalid password format' });
      }

      if (password.length > 100) {
        recordAttempt(clientIP);
        return res.status(400).json({ success: false, error: 'Password too long' });
      }

      // Timing attack protection
      const startTime = Date.now();
      const isValid = password === SECRET_PASSWORD;
      const endTime = Date.now();
      
      // Ensure minimum processing time to prevent timing attacks
      const minTime = 100; // 100ms
      if (endTime - startTime < minTime) {
        await new Promise(resolve => setTimeout(resolve, minTime - (endTime - startTime)));
      }

      if (isValid) {
        clearAttempts(clientIP);
        
        const token = jwt.sign(
          { 
            authenticated: true,
            ip: clientIP,
            timestamp: Date.now()
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.status(200).json({ success: true, token });
      } else {
        recordAttempt(clientIP);
        return res.status(401).json({ success: false, error: 'Invalid password' });
      }
    }

    if (action === 'verify') {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Additional verification
        if (decoded.authenticated && decoded.ip === clientIP) {
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
