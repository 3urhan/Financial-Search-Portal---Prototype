/**
 * Navigation Controller
 * Handles sidebar navigation and profile overlay
 */

const Navigation = {
    overlay: null,
    overlayTitle: null,
    overlaySubtitle: null,
    overlayNav: null,
    currentItem: null,

    /**
     * Initialize navigation
     */
    init() {
        this.overlay = document.getElementById('profileOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlaySubtitle = document.getElementById('overlaySubtitle');
        this.overlayNav = document.getElementById('overlayNav');

        this.setupEventListeners();
        this.updateSidebarNav();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const closeBtn = document.getElementById('closeOverlay');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeOverlay());
        }

        const backdrop = document.getElementById('overlayBackdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeOverlay());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay && !this.overlay.classList.contains('hidden')) {
                this.closeOverlay();
            }
        });

        document.querySelectorAll('.tag[data-search]').forEach((tag) => {
            tag.addEventListener('click', (e) => {
                const searchTerm = e.currentTarget.dataset.search;
                const results = window.FinancialData.searchItems(searchTerm);
                if (results.length > 0) {
                    this.showProfileOverlay(results[0]);
                }
            });
        });

        document.querySelectorAll('.nav-item a[data-category]').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.currentTarget.dataset.category || '';
                if (category) {
                    window.location.href = `search-results.html?q=${encodeURIComponent(category)}`;
                }
            });
        });
    },

    /**
     * Show profile navigation overlay
     * @param {Object} item - Financial item
     */
    showProfileOverlay(item) {
        if (!this.overlay || !this.overlayTitle || !this.overlaySubtitle || !this.overlayNav) return;

        this.currentItem = item;
        this.overlayTitle.textContent = item.name;
        this.overlaySubtitle.textContent = `${item.symbol} - ${item.type}`;

        this.overlayNav.innerHTML = item.sections.map((section) => `
            <li class="overlay-nav-item">
                <a href="#" data-section="${section}">
                    ${section}
                </a>
            </li>
        `).join('');

        this.overlayNav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(item, section);
            });
        });

        this.overlay.classList.remove('hidden');
    },

    /**
     * Close profile overlay
     */
    closeOverlay() {
        if (this.overlay) {
            this.overlay.classList.add('hidden');
        }
    },

    /**
     * Navigate to specific section of an item
     * @param {Object} item - Financial item
     * @param {string} section - Section name
     */
    navigateToSection(item, section) {
        this.closeOverlay();
        window.Router.loadPage(item, section, { pushHistory: true });
    },

    /**
     * Update sidebar navigation with recent items
     */
    updateSidebarNav() {
        const recentNav = document.getElementById('recentNav');
        if (!recentNav || !window.Router) return;

        const recentItems = window.Router.recentItems;

        if (recentItems.length === 0) {
            recentNav.innerHTML = '<li class="nav-item empty-state">No recent items</li>';
            return;
        }

        recentNav.innerHTML = recentItems.map((item) => `
            <li class="nav-item">
                <a href="#" data-item-id="${item.id}" class="${window.Router.currentPage?.id === item.id ? 'active' : ''}">
                    <span class="icon">${item.icon}</span>
                    ${item.symbol || item.name}
                </a>
            </li>
        `).join('');

        recentNav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = e.currentTarget.dataset.itemId;
                window.Router.navigateTo(itemId);
            });
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Navigation.init());
} else {
    Navigation.init();
}

window.Navigation = Navigation;
