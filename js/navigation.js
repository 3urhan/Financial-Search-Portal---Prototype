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
        // Get DOM elements
        this.overlay = document.getElementById('profileOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlaySubtitle = document.getElementById('overlaySubtitle');
        this.overlayNav = document.getElementById('overlayNav');

        // Setup event listeners
        this.setupEventListeners();
        
        // Initial sidebar update
        this.updateSidebarNav();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close overlay button
        const closeBtn = document.getElementById('closeOverlay');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeOverlay());
        }

        // Close on backdrop click
        const backdrop = document.getElementById('overlayBackdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeOverlay());
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.overlay.classList.contains('hidden')) {
                this.closeOverlay();
            }
        });

        // Quick link tags
        document.querySelectorAll('.tag[data-search]').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const searchTerm = e.target.dataset.search;
                const results = window.FinancialData.searchItems(searchTerm);
                if (results.length > 0) {
                    this.showProfileOverlay(results[0]);
                }
            });
        });
    },

    /**
     * Show profile navigation overlay
     * @param {Object} item - Financial item
     */
    showProfileOverlay(item) {
        this.currentItem = item;

        // Update overlay content
        this.overlayTitle.textContent = item.name;
        this.overlaySubtitle.textContent = `${item.symbol} • ${item.type}`;

        // Build navigation list
        this.overlayNav.innerHTML = item.sections.map(section => `
            <li class="overlay-nav-item">
                <a href="#" data-section="${section}">
                    ${section}
                </a>
            </li>
        `).join('');

        // Add click handlers to nav items
        this.overlayNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.navigateToSection(item, section);
            });
        });

        // Show overlay
        this.overlay.classList.remove('hidden');
    },

    /**
     * Close profile overlay
     */
    closeOverlay() {
        this.overlay.classList.add('hidden');
    },

    /**
     * Navigate to specific section of an item
     * @param {Object} item - Financial item
     * @param {string} section - Section name
     */
    navigateToSection(item, section) {
        // Close overlay
        this.closeOverlay();

        // Load page with section
        window.Router.loadPage(item, section);
    },

    /**
     * Update sidebar navigation with recent items
     */
    updateSidebarNav() {
        const recentNav = document.getElementById('recentNav');
        if (!recentNav) return;

        const recentItems = window.Router.recentItems;

        if (recentItems.length === 0) {
            recentNav.innerHTML = '<li class="nav-item empty-state">No recent items</li>';
            return;
        }

        recentNav.innerHTML = recentItems.map(item => `
            <li class="nav-item">
                <a href="#" data-item-id="${item.id}" class="${window.Router.currentPage?.id === item.id ? 'active' : ''}">
                    <span class="icon">${item.icon}</span>
                    ${item.symbol || item.name}
                </a>
            </li>
        `).join('');

        // Add click handlers
        recentNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = e.currentTarget.dataset.itemId;
                window.Router.navigateTo(itemId);
            });
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Navigation.init());
} else {
    Navigation.init();
}

// Make globally available
window.Navigation = Navigation;