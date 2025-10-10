// Enhanced secure authentication with additional protections
class SecurePortfolioAuth {
  constructor() {
    this.apiUrl = '/api/auth';
    this.tokenKey = 'portfolio_auth_token';
    this.sessionKey = 'portfolio_session';
    this.attemptKey = 'auth_attempts';
    this.maxAttempts = 5;
    this.lockoutTime = 15 * 60 * 1000; // 15 minutes
  }

  // Rate limiting protection
  checkRateLimit() {
    const attempts = JSON.parse(localStorage.getItem(this.attemptKey) || '[]');
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < this.lockoutTime);
    
    if (recentAttempts.length >= this.maxAttempts) {
      const oldestAttempt = Math.min(...recentAttempts);
      const remainingTime = this.lockoutTime - (now - oldestAttempt);
      return {
        allowed: false,
        remainingTime: Math.ceil(remainingTime / 1000 / 60) // minutes
      };
    }
    
    return { allowed: true };
  }

  // Record failed attempt
  recordAttempt() {
    const attempts = JSON.parse(localStorage.getItem(this.attemptKey) || '[]');
    const now = Date.now();
    attempts.push(now);
    
    // Keep only recent attempts
    const recentAttempts = attempts.filter(time => now - time < this.lockoutTime);
    localStorage.setItem(this.attemptKey, JSON.stringify(recentAttempts));
  }

  // Clear attempts on successful login
  clearAttempts() {
    localStorage.removeItem(this.attemptKey);
  }

  // Enhanced login with rate limiting
  async login(password) {
    // Check rate limiting
    const rateLimit = this.checkRateLimit();
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Too many failed attempts. Try again in ${rateLimit.remainingTime} minutes.`
      };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          password: password,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.clearAttempts();
        localStorage.setItem(this.tokenKey, data.token);
        localStorage.setItem(this.sessionKey, 'true');
        return { success: true };
      } else {
        this.recordAttempt();
        return { success: false, error: data.error };
      }
    } catch (error) {
      this.recordAttempt();
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async verifyAuth() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return false;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          token: token,
          timestamp: Date.now()
        })
      });

      const data = await response.json();
      return data.success && data.authenticated;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.sessionKey);
    this.clearAttempts();
  }

  isAuthenticated() {
    return !!localStorage.getItem(this.tokenKey);
  }

  // Get remaining lockout time
  getLockoutTime() {
    const rateLimit = this.checkRateLimit();
    return rateLimit.allowed ? 0 : rateLimit.remainingTime;
  }
}

// Global auth instance
window.portfolioAuth = new SecurePortfolioAuth();
