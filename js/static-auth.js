// Static hosting fallback authentication
// This is NOT secure but provides basic obfuscation for static sites
class StaticAuth {
  constructor() {
    this.tokenKey = 'portfolio_auth_token';
    this.sessionKey = 'portfolio_session';
    this.sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Simple obfuscation (NOT encryption - just makes it harder to find)
  obfuscate(str) {
    return btoa(unescape(encodeURIComponent(str))).split('').reverse().join('');
  }

  deobfuscate(str) {
    try {
      return decodeURIComponent(escape(atob(str.split('').reverse().join(''))));
    } catch {
      return null;
    }
  }

  // Create a simple token with timestamp
  createToken() {
    const token = {
      auth: true,
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(7)
    };
    return this.obfuscate(JSON.stringify(token));
  }

  // Verify token
  verifyToken(token) {
    try {
      const decoded = this.deobfuscate(token);
      if (!decoded) return false;
      
      const data = JSON.parse(decoded);
      const now = Date.now();
      
      // Check if token is expired
      if (now - data.timestamp > this.sessionDuration) {
        this.logout();
        return false;
      }
      
      return data.auth === true;
    } catch {
      return false;
    }
  }

  async login(password) {
    // In a real implementation, this would be server-side
    // For static hosting, we use a simple check with obfuscation
    const validPasswords = [
      'mollytea',
      // Add more passwords here if needed
    ];
    
    if (validPasswords.includes(password)) {
      const token = this.createToken();
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.sessionKey, 'true');
      return { success: true };
    } else {
      return { success: false, error: 'Invalid password' };
    }
  }

  async verifyAuth() {
    const token = localStorage.getItem(this.tokenKey);
    const session = localStorage.getItem(this.sessionKey);
    
    if (!token || !session) return false;
    
    return this.verifyToken(token);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.sessionKey);
  }

  isAuthenticated() {
    return !!localStorage.getItem(this.tokenKey);
  }
}

// Global auth instance
window.portfolioAuth = new StaticAuth();
