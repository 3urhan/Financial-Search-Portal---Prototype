/**
 * Search Controller
 * Handles search input and results display
 */

const Search = {
    searchInput: null,
    searchDropdown: null,
    activeIndex: -1,
    currentResults: [],
    debounceTimer: null,

    /**
     * Initialize search
     */
    init() {
        this.searchInput = document.getElementById('mainSearch');
        this.searchDropdown = document.getElementById('searchDropdown');

        if (!this.searchInput) return;

        this.setupEventListeners();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Input event with debounce
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 200);
        });

        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            if (!this.searchDropdown || this.searchDropdown.classList.contains('hidden')) return;

            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateResults(1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateResults(-1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.selectResult();
                    break;
                case 'Escape':
                    this.hideDropdown();
                    break;
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchDropdown?.contains(e.target)) {
                this.hideDropdown();
            }
        });

        // Focus shows recent results
        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.trim() === '') {
                this.showRecentSearches();
            }
        });
    },

    /**
     * Handle search query
     * @param {string} query - Search query
     */
    handleSearch(query) {
        if (!query || query.trim() === '') {
            this.showRecentSearches();
            return;
        }

        const results = window.FinancialData.searchItems(query);
        this.currentResults = results;
        this.displayResults(results, query);
    },

    /**
     * Display search results
     * @param {Array} results - Search results
     * @param {string} query - Search query
     */
    displayResults(results, query) {
        if (!this.searchDropdown) return;

        if (results.length === 0) {
            this.searchDropdown.innerHTML = `
                <div class="search-no-results">
                    <p>No results found for "${query}"</p>
                </div>
            `;
            this.searchDropdown.classList.remove('hidden');
            return;
        }

        // Group by type
        const grouped = results.reduce((acc, item) => {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(item);
            return acc;
        }, {});

        let html = '';
        
        Object.entries(grouped).forEach(([type, items]) => {
            html += `<div class="search-category-header">${type}</div>`;
            items.slice(0, 5).forEach((item, index) => {
                html += `
                    <div class="search-result-item" data-index="${results.indexOf(item)}" data-item-id="${item.id}">
                        <div class="search-result-icon">${item.icon}</div>
                        <div class="search-result-info">
                            <div class="search-result-name">${this.highlightQuery(item.name, query)}</div>
                            <div class="search-result-meta">${item.symbol} • ${item.type}</div>
                        </div>
                    </div>
                `;
            });
        });

        // Add "View All" if many results
        if (results.length > 10) {
            html += `
                <div class="search-view-all" data-query="${query}">
                    View all ${results.length} results
                </div>
            `;
        }

        this.searchDropdown.innerHTML = html;
        this.searchDropdown.classList.remove('hidden');

        // Add click handlers
        this.searchDropdown.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const itemId = item.dataset.itemId;
                // const financialItem = window.FinancialData.getItemById(itemId);
                // if (financialItem && window.Navigation) {
                //     window.Navigation.showProfileOverlay(financialItem);
            //         this.hideDropdown();
            //         this.searchInput.value = '';
            //     }
            // });
                 if (window.Router) {
            window.Router.navigateTo(itemId);
             }
        
        this.hideDropdown();
        this.searchInput.value = '';
    });
        });

        // View all handler
        const viewAll = this.searchDropdown.querySelector('.search-view-all');
        if (viewAll) {
            viewAll.addEventListener('click', () => {
                window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
            });
        }

        this.activeIndex = -1;
    },

    /**
     * Show recent searches
     */
    showRecentSearches() {
        if (!this.searchDropdown) return;

        const recentItems = window.Router.recentItems.slice(0, 5);

        if (recentItems.length === 0) {
            this.hideDropdown();
            return;
        }

        let html = '<div class="search-category-header">Recent</div>';
        
        recentItems.forEach(item => {
            html += `
                <div class="search-result-item" data-item-id="${item.id}">
                    <div class="search-result-icon">${item.icon}</div>
                    <div class="search-result-info">
                        <div class="search-result-name">${item.name}</div>
                        <div class="search-result-meta">${item.symbol} • ${item.type}</div>
                    </div>
                </div>
            `;
        });

        this.searchDropdown.innerHTML = html;
        this.searchDropdown.classList.remove('hidden');

        // Add click handlers
        this.searchDropdown.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const itemId = item.dataset.itemId;
                const financialItem = window.FinancialData.getItemById(itemId);
                if (financialItem) {
                    window.Router.navigateTo(itemId);
                    this.hideDropdown();
                    this.searchInput.value = '';
                }
            });
        });
    },

    /**
     * Navigate through results with keyboard
     * @param {number} direction - 1 for down, -1 for up
     */
    navigateResults(direction) {
        const items = this.searchDropdown.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        // Remove active class from current
        if (this.activeIndex >= 0 && items[this.activeIndex]) {
            items[this.activeIndex].classList.remove('active');
        }

        // Update index
        this.activeIndex += direction;
        
        if (this.activeIndex < 0) {
            this.activeIndex = items.length - 1;
        } else if (this.activeIndex >= items.length) {
            this.activeIndex = 0;
        }

        // Add active class to new
        items[this.activeIndex].classList.add('active');
        items[this.activeIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },

    /**
     * Select current active result
     */
    selectResult() {
        const items = this.searchDropdown.querySelectorAll('.search-result-item');
        if (this.activeIndex >= 0 && items[this.activeIndex]) {
            items[this.activeIndex].click();
        }
    },

    /**
     * Hide dropdown
     */
    hideDropdown() {
        if (this.searchDropdown) {
            this.searchDropdown.classList.add('hidden');
        }
        this.activeIndex = -1;
    },

    /**
     * Highlight query in text
     * @param {string} text - Text to highlight
     * @param {string} query - Query to highlight
     * @returns {string} HTML with highlighted text
     */
    highlightQuery(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Search.init());
} else {
    Search.init();
}

// Make globally available
window.Search = Search;