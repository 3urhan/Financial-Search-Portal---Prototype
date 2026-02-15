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
        // Check URL parameters on load
        this.checkURLParams();
        
        // Listen for browser back/forward
        window.addEventListener('popstate', () => {
            this.checkURLParams();
        });
    },

    /**
     * Check URL parameters and route accordingly
     */
    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('item');
        const section = urlParams.get('section');

        if (itemId) {
            const item = window.FinancialData.getItemById(itemId);
            if (item) {
                this.loadPage(item, section);
            }
        }
    },

    /**
     * Load a page for a specific item
     * @param {Object} item - Financial item
     * @param {string} section - Optional section to highlight
     */
    async loadPage(item, section = null) {
        const mainContent = document.getElementById('mainContent');
        const loadingIndicator = document.getElementById('loadingIndicator');

        // Show loading
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }

        try {
            // Fetch page content
            const response = await fetch(item.page);
            if (!response.ok) throw new Error('Page not found');
            
            const html = await response.text();

            // Update main content
            mainContent.innerHTML = html;

            // Update URL
            const url = new URL(window.location);
            url.searchParams.set('item', item.id);
            if (section) {
                url.searchParams.set('section', section);
            } else {
                url.searchParams.delete('section');
            }
            window.history.pushState({}, '', url);

            // Update current page
            this.currentPage = item;

            // Add to recent items
            this.addToRecent(item);

            // Update navigation
            if (window.Navigation) {
                window.Navigation.updateSidebarNav();
            }

            // Scroll to top
            mainContent.scrollTop = 0;

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
            // Hide loading
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
        }
    },

    /**
     * Add item to recent items list
     * @param {Object} item - Financial item
     */
    addToRecent(item) {
        // Remove if already exists
        this.recentItems = this.recentItems.filter(i => i.id !== item.id);
        
        // Add to beginning
        this.recentItems.unshift(item);
        
        // Keep only max items
        if (this.recentItems.length > this.maxRecentItems) {
            this.recentItems = this.recentItems.slice(0, this.maxRecentItems);
        }

        // Save to localStorage
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
            if (saved) {
                this.recentItems = JSON.parse(saved);
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
            this.loadPage(item, section);
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Router.init());
} else {
    Router.init();
}

// Load recent items
Router.loadRecent();

// Make globally available
window.Router = Router;