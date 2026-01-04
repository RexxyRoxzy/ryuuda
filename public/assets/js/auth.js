class DiscordAuth {
  constructor() {
    this.user = null;
    this.apiBase = '/api/auth'; // Vercel API routes
    this.init();
  }

  async login() {
    window.location.href = `${this.apiBase}/login`;
  }

  async checkAuth() {
    try {
      const response = await fetch(`${this.apiBase}/user`);
      if (response.ok) {
        this.user = await response.json();
      }
    } catch (error) {
      console.log('Not authenticated');
    }
  }

  async logout() {
    await fetch(`${this.apiBase}/logout`);
    this.user = null;
    this.renderAuthButton();
  }
}
