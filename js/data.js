/**
 * Financial Data Registry
 * This file contains all financial items searchable in the system.
 */

const FinancialData = {
    items: [
        // Stocks
        {
            id: 'aapl',
            name: 'Apple Inc.',
            symbol: 'AAPL',
            type: 'Stocks',
            icon: 'STK',
            description: 'Technology company specializing in consumer electronics',
            page: 'pages/stocks/aapl.html',
            sections: ['Overview', 'Financials', 'News & Analysis', 'Historical Data', 'Charts']
        },
        {
            id: 'msft',
            name: 'Microsoft Corporation',
            symbol: 'MSFT',
            type: 'Stocks',
            icon: 'STK',
            description: 'Technology corporation developing software and services',
            page: 'pages/stocks/msft.html',
            sections: ['Overview', 'Financials', 'News & Analysis', 'Historical Data', 'Charts']
        },
        {
            id: 'googl',
            name: 'Alphabet Inc.',
            symbol: 'GOOGL',
            type: 'Stocks',
            icon: 'STK',
            description: 'Parent company of Google and subsidiaries',
            page: 'pages/stocks/googl.html',
            sections: ['Overview', 'Financials', 'News & Analysis', 'Historical Data', 'Charts']
        },
        {
            id: 'amzn',
            name: 'Amazon.com Inc.',
            symbol: 'AMZN',
            type: 'Stocks',
            icon: 'STK',
            description: 'E-commerce and cloud computing company',
            page: 'pages/stocks/aapl.html',
            sections: ['Overview', 'Financials', 'News & Analysis', 'Historical Data', 'Charts'],
            isTemplate: true
        },
        {
            id: 'tsla',
            name: 'Tesla Inc.',
            symbol: 'TSLA',
            type: 'Stocks',
            icon: 'STK',
            description: 'Electric vehicle and clean energy company',
            page: 'pages/stocks/aapl.html',
            sections: ['Overview', 'Financials', 'News & Analysis', 'Historical Data', 'Charts'],
            isTemplate: true
        },

        // Bonds
        {
            id: 'us-treasury',
            name: 'US Treasury Bonds',
            symbol: 'US10Y',
            type: 'Bonds',
            icon: 'BND',
            description: '10-Year US Government Bonds',
            page: 'pages/bonds/us-treasury.html',
            sections: ['Overview', 'Yield Analysis', 'Historical Performance', 'Market Trends']
        },
        {
            id: 'corporate-bonds',
            name: 'Corporate Bonds',
            symbol: 'CORP',
            type: 'Bonds',
            icon: 'BND',
            description: 'Investment grade corporate bonds',
            page: 'pages/bonds/us-treasury.html',
            sections: ['Overview', 'Yield Analysis', 'Historical Performance', 'Market Trends'],
            isTemplate: true
        },

        // ETFs
        {
            id: 'spy',
            name: 'SPDR S&P 500 ETF',
            symbol: 'SPY',
            type: 'ETFs',
            icon: 'ETF',
            description: 'Tracks the S&P 500 index',
            page: 'pages/stocks/aapl.html',
            sections: ['Overview', 'Holdings', 'Performance', 'Distributions', 'Analysis'],
            isTemplate: true
        },
        {
            id: 'qqq',
            name: 'Invesco QQQ Trust',
            symbol: 'QQQ',
            type: 'ETFs',
            icon: 'ETF',
            description: 'Tracks the Nasdaq-100 index',
            page: 'pages/stocks/aapl.html',
            sections: ['Overview', 'Holdings', 'Performance', 'Distributions', 'Analysis'],
            isTemplate: true
        },
        {
            id: 'vti',
            name: 'Vanguard Total Stock Market ETF',
            symbol: 'VTI',
            type: 'ETFs',
            icon: 'ETF',
            description: 'Broad US stock market exposure',
            page: 'pages/stocks/aapl.html',
            sections: ['Overview', 'Holdings', 'Performance', 'Distributions', 'Analysis'],
            isTemplate: true
        },

        // Mutual Funds
        {
            id: 'vanguard-500',
            name: 'Vanguard 500 Index Fund',
            symbol: 'VFIAX',
            type: 'Mutual Funds',
            icon: 'FND',
            description: 'Index fund tracking S&P 500',
            page: 'pages/funds/vanguard-500.html',
            sections: ['Overview', 'Portfolio', 'Performance', 'Fees & Expenses', 'Analysis']
        },
        {
            id: 'fidelity-total-market',
            name: 'Fidelity Total Market Index Fund',
            symbol: 'FSKAX',
            type: 'Mutual Funds',
            icon: 'FND',
            description: 'Total US stock market index fund',
            page: 'pages/funds/vanguard-500.html',
            sections: ['Overview', 'Portfolio', 'Performance', 'Fees & Expenses', 'Analysis'],
            isTemplate: true
        }
    ],

    /**
     * Search items by query
     * @param {string} query - Search query
     * @returns {Array} Matching items
     */
    searchItems(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        const searchTerm = query.toLowerCase();

        return this.items.filter((item) => (
            item.name.toLowerCase().includes(searchTerm) ||
            item.symbol.toLowerCase().includes(searchTerm) ||
            item.type.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm))
        ));
    },

    /**
     * Get item by ID
     * @param {string} id - Item ID
     * @returns {Object|null} Item or null
     */
    getItemById(id) {
        return this.items.find((item) => item.id === id) || null;
    },

    /**
     * Get items by type/category
     * @param {string} type - Item type
     * @returns {Array} Matching items
     */
    getItemsByType(type) {
        return this.items.filter((item) => item.type.toLowerCase() === type.toLowerCase());
    }
};

window.FinancialData = FinancialData;
