// Netlify Function for authentication
const crypto = require('crypto');

// In production, store this in environment variables
const SECRET_PASSWORD = process.env.PORTFOLIO_PASSWORD || 'mollytea';
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Simple JWT implementation for demo (use jsonwebtoken in production)
function createToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    
    // Check if token is expired (24 hours)
    if (Date.now() > payload.exp * 1000) return null;
    
    return payload;
  } catch {
    return null;
  }
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { action, password, token } = JSON.parse(event.body);

    if (action === 'login') {
      if (password === SECRET_PASSWORD) {
        const token = createToken({
          authenticated: true,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, token })
        };
      } else {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, error: 'Invalid password' })
        };
      }
    }

    if (action === 'verify') {
      const payload = verifyToken(token);
      if (payload && payload.authenticated) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, authenticated: true })
        };
      } else {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, authenticated: false })
        };
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
