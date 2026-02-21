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
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 200);
        });

        this.searchInput.addEventListener('keydown', (e) => {
            if (!this.searchDropdown || this.searchDropdown.classList.contains('hidden')) return;

            switch (e.key) {
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

        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchDropdown?.contains(e.target)) {
                this.hideDropdown();
            }
        });

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
            const safeQuery = this.escapeHtml(query);
            this.searchDropdown.innerHTML = `
                <div class="search-no-results">
                    <p>No results found for "${safeQuery}"</p>
                </div>
            `;
            this.searchDropdown.classList.remove('hidden');
            return;
        }

        const grouped = results.reduce((acc, item) => {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(item);
            return acc;
        }, {});

        let html = '';

        Object.entries(grouped).forEach(([type, items]) => {
            html += `<div class="search-category-header">${this.escapeHtml(type)}</div>`;
            items.slice(0, 5).forEach((item) => {
                html += `
                    <div class="search-result-item" data-index="${results.indexOf(item)}" data-item-id="${this.escapeHtml(item.id)}">
                        <div class="search-result-icon">${this.escapeHtml(item.icon || '')}</div>
                        <div class="search-result-info">
                            <div class="search-result-name">${this.highlightQuery(item.name, query)}</div>
                            <div class="search-result-meta">${this.escapeHtml(item.symbol || '')} - ${this.escapeHtml(item.type || '')}</div>
                        </div>
                    </div>
                `;
            });
        });

        if (results.length > 10) {
            html += `
                <div class="search-view-all" data-query="${this.escapeHtml(query)}">
                    View all ${results.length} results
                </div>
            `;
        }

        this.searchDropdown.innerHTML = html;
        this.searchDropdown.classList.remove('hidden');

        this.searchDropdown.querySelectorAll('.search-result-item').forEach((item) => {
            item.addEventListener('click', () => {
                const itemId = item.dataset.itemId;
                if (window.Router) {
                    window.Router.navigateTo(itemId);
                }

                this.hideDropdown();
                this.searchInput.value = '';
            });
        });

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
        if (!this.searchDropdown || !window.Router) return;

        const recentItems = window.Router.recentItems.slice(0, 5);

        if (recentItems.length === 0) {
            this.hideDropdown();
            return;
        }

        let html = '<div class="search-category-header">Recent</div>';

        recentItems.forEach((item) => {
            html += `
                <div class="search-result-item" data-item-id="${this.escapeHtml(item.id)}">
                    <div class="search-result-icon">${this.escapeHtml(item.icon || '')}</div>
                    <div class="search-result-info">
                        <div class="search-result-name">${this.escapeHtml(item.name || '')}</div>
                        <div class="search-result-meta">${this.escapeHtml(item.symbol || '')} - ${this.escapeHtml(item.type || '')}</div>
                    </div>
                </div>
            `;
        });

        this.searchDropdown.innerHTML = html;
        this.searchDropdown.classList.remove('hidden');

        this.searchDropdown.querySelectorAll('.search-result-item').forEach((item) => {
            item.addEventListener('click', () => {
                const itemId = item.dataset.itemId;
                const financialItem = window.FinancialData.getItemById(itemId);
                if (financialItem && window.Router) {
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

        if (this.activeIndex >= 0 && items[this.activeIndex]) {
            items[this.activeIndex].classList.remove('active');
        }

        this.activeIndex += direction;

        if (this.activeIndex < 0) {
            this.activeIndex = items.length - 1;
        } else if (this.activeIndex >= items.length) {
            this.activeIndex = 0;
        }

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
        const safeText = this.escapeHtml(text || '');
        if (!query) return safeText;

        const escapedQuery = this.escapeRegExp(query);
        if (!escapedQuery) return safeText;

        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return safeText.replace(regex, '<strong>$1</strong>');
    },

    /**
     * Escape regex metacharacters from user input
     * @param {string} value - Raw value
     * @returns {string} Escaped value
     */
    escapeRegExp(value) {
        return (value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Escape HTML entities before injecting into innerHTML
     * @param {string} value - Raw value
     * @returns {string} Escaped HTML string
     */
    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Search.init());
} else {
    Search.init();
}

window.Search = Search;
