class DiscordAuth {
    constructor() {
        this.user = null;
        this.apiBase = '/api'; // Same origin as your website
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.renderAuthButton();
        
        // Check for auth errors in URL
        this.checkUrlParams();
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        
        if (error) {
            this.showNotification(`Authentication error: ${error}`, 'error');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? 'rgba(255, 80, 80, 0.9)' : 'rgba(88, 101, 242, 0.9)'};
            color: white;
            border-radius: 10px;
            z-index: 9999;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    async checkAuth() {
        try {
            const response = await fetch(`${this.apiBase}/auth/user`, {
                credentials: 'include' // Important for sessions
            });
            
            if (response.ok) {
                this.user = await response.json();
                return true;
            }
            return false;
        } catch (error) {
            console.log('Not authenticated or server error:', error);
            return false;
        }
    }

    login() {
        // Redirect to Discord OAuth
        window.location.href = `${this.apiBase}/auth/login`;
    }

    async logout() {
        try {
            const response = await fetch(`${this.apiBase}/auth/logout`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                this.user = null;
                this.renderAuthButton();
                this.showNotification('Successfully logged out', 'success');
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Logout failed', 'error');
        }
    }

    getAvatarUrl(userId, avatarHash) {
        if (!avatarHash) return null;
        // You can adjust the size: 64, 128, 256, 512, 1024
        return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.webp?size=256`;
    }

    getBannerUrl(userId, bannerHash) {
        if (!bannerHash) return null;
        return `https://cdn.discordapp.com/banners/${userId}/${bannerHash}.webp?size=600`;
    }

    getDefaultAvatarColor(discriminator) {
        const colors = [
            '#ff3b1a', '#ff6a00', '#ffd000', '#1aff6a',
            '#1a8cff', '#8c1aff', '#ff1a8c', '#1affd0'
        ];
        const num = parseInt(discriminator) || 0;
        return colors[num % colors.length];
    }

    renderAuthButton() {
        const container = document.getElementById('auth-button-container');
        
        if (!container) {
            console.error('Auth button container not found!');
            return;
        }
        
        if (this.user) {
            // User is logged in - show profile
            const avatarUrl = this.getAvatarUrl(this.user.id, this.user.avatar);
            const displayName = this.user.global_name || this.user.username;
            const discriminator = this.user.discriminator && this.user.discriminator !== '0' 
                ? `#${this.user.discriminator}` 
                : '';
            const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
            
            container.innerHTML = `
                <div class="user-dropdown">
                    <div class="user-profile" title="${displayName}${discriminator}">
                        <div class="user-avatar ${avatarUrl ? '' : 'default'}" 
                             style="${!avatarUrl ? `background: ${this.getDefaultAvatarColor(this.user.discriminator)}` : ''}">
                            ${avatarUrl 
                                ? `<img src="${avatarUrl}" alt="${displayName}" 
                                     onerror="this.style.display='none';this.parentElement.classList.add('default');this.parentElement.textContent='${initials.charAt(0)}';this.parentElement.style.background='${this.getDefaultAvatarColor(this.user.discriminator)}'">`
                                : initials.charAt(0)
                            }
                            ${this.user.premium_type ? '<div class="premium-badge"><i class="fas fa-crown"></i></div>' : ''}
                        </div>
                        <div class="user-info">
                            <span class="user-name">${displayName}</span>
                            ${discriminator ? `<span class="user-discriminator">${discriminator}</span>` : ''}
                        </div>
                        <i class="fas fa-chevron-down dropdown-arrow"></i>
                    </div>
                    <div class="dropdown-menu">
                        <div class="dropdown-header">
                            <div class="user-name">${displayName}${discriminator}</div>
                            ${this.user.email ? `<div class="user-email">${this.user.email}</div>` : ''}
                        </div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-item" onclick="window.open('https://discord.com/users/${this.user.id}', '_blank')">
                            <i class="fas fa-external-link-alt"></i>
                            <span>Open Discord Profile</span>
                        </div>
                        <div class="dropdown-item" onclick="window.location.href='/dashboard'">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>Dashboard</span>
                        </div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-item logout" onclick="auth.logout()">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Log Out</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // User is not logged in - show login button
            container.innerHTML = `
                <button class="btn discord" onclick="auth.login()">
                    <i class="fab fa-discord"></i>
                    <span>Login with Discord</span>
                </button>
            `;
        }
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new DiscordAuth();
    
    // Add CSS animations for notifications
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .premium-badge {
                position: absolute;
                bottom: -4px;
                right: -4px;
                background: linear-gradient(135deg, #ffd000, #ff6a00);
                border-radius: 50%;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #000;
                border: 2px solid var(--bg0);
            }
        `;
        document.head.appendChild(style);
    }
});