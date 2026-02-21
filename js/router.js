/**
 * Simple Router for handling page navigation
 */

const Router = {
    currentPage: null,
    recentItems: [],
    maxRecentItems: 5,

    /**
     * Initialize router
     */
    init() {
        this.checkURLParams(false);

        window.addEventListener('popstate', () => {
            this.checkURLParams(false);
        });
    },

    /**
     * Check URL parameters and route accordingly
     * @param {boolean} pushHistory - Whether to push history while loading item
     */
    checkURLParams(pushHistory = true) {
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('item');
        const section = urlParams.get('section');

        if (!itemId) return;

        const item = window.FinancialData.getItemById(itemId);
        if (item) {
            this.loadPage(item, section, { pushHistory });
        }
    },

    /**
     * Load a page for a specific item
     * @param {Object} item - Financial item
     * @param {string} section - Optional section to highlight
     * @param {Object} options - Routing options
     */
    async loadPage(item, section = null, options = {}) {
        const pushHistory = options.pushHistory !== false;
        const mainContent = document.getElementById('mainContent');
        const loadingIndicator = document.getElementById('loadingIndicator');

        if (!mainContent) {
            console.warn('Main content container (#mainContent) was not found.');
            return;
        }

        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }

        try {
            const response = await fetch(item.page);
            if (!response.ok) throw new Error('Page not found');

            const html = await response.text();
            mainContent.innerHTML = html;
            this.applyTemplateBanner(item, mainContent);

            if (pushHistory) {
                const url = new URL(window.location);
                url.searchParams.set('item', item.id);
                if (section) {
                    url.searchParams.set('section', section);
                } else {
                    url.searchParams.delete('section');
                }
                window.history.pushState({}, '', url);
            }

            this.currentPage = item;
            this.addToRecent(item);

            if (window.Navigation) {
                window.Navigation.updateSidebarNav();
            }

            this.focusSection(section, mainContent);
            if (!section) {
                mainContent.scrollTop = 0;
            }
        } catch (error) {
            console.error('Error loading page:', error);
            mainContent.innerHTML = `
                <div class="content-page">
                    <div class="content-header">
                        <h1 class="content-title">Error Loading Page</h1>
                        <p class="content-subtitle">The requested page could not be loaded.</p>
                    </div>
                    <p>Please try again or contact support if the problem persists.</p>
                </div>
            `;
        } finally {
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
        }
    },

    /**
     * Add a visible note when a page is a shared demo template
     * @param {Object} item - Financial item
     * @param {HTMLElement} mainContent - Main content container
     */
    applyTemplateBanner(item, mainContent) {
        if (!item?.isTemplate) return;

        const contentPage = mainContent.querySelector('.content-page');
        if (!contentPage) return;

        const banner = document.createElement('div');
        banner.className = 'template-banner';
        banner.textContent = `Demo template content is shown for ${item.symbol || item.name}.`;
        contentPage.prepend(banner);
    },

    /**
     * Scroll to a requested section if available
     * @param {string|null} section - Section label
     * @param {HTMLElement} mainContent - Main content container
     */
    focusSection(section, mainContent) {
        if (!section) return;

        const normalizedId = this.toSectionId(section);
        const target = mainContent.querySelector(`#${CSS.escape(normalizedId)}`);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    /**
     * Convert display label into stable section id
     * @param {string} section - Section display text
     * @returns {string}
     */
    toSectionId(section) {
        return String(section)
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    },

    /**
     * Add item to recent items list
     * @param {Object} item - Financial item
     */
    addToRecent(item) {
        this.recentItems = this.recentItems.filter((i) => i.id !== item.id);
        this.recentItems.unshift(item);

        if (this.recentItems.length > this.maxRecentItems) {
            this.recentItems = this.recentItems.slice(0, this.maxRecentItems);
        }

        try {
            localStorage.setItem('recentItems', JSON.stringify(this.recentItems));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    },

    /**
     * Load recent items from localStorage
     */
    loadRecent() {
        try {
            const saved = localStorage.getItem('recentItems');
            if (!saved) return;

            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                this.recentItems = parsed;
            }
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
        }
    },

    /**
     * Navigate to item
     * @param {string} itemId - Item ID
     * @param {string} section - Optional section
     */
    navigateTo(itemId, section = null) {
        const item = window.FinancialData.getItemById(itemId);
        if (item) {
            this.loadPage(item, section, { pushHistory: true });
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Router.init());
} else {
    Router.init();
}

Router.loadRecent();
window.Router = Router;
