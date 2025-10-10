// Secure authentication utility
class PortfolioAuth {
  constructor() {
    this.apiUrl = '/api/auth';
    this.tokenKey = 'portfolio_auth_token';
  }

  async login(password) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          password: password
        })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem(this.tokenKey, data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
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
          token: token
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
  }

  isAuthenticated() {
    return !!localStorage.getItem(this.tokenKey);
  }
}

// Global auth instance
window.portfolioAuth = new PortfolioAuth();
