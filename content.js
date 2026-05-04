// Default configuration parameters
let prefs = { enabled: true, gridCount: 6, showShorts: false, showGames: false, showPosts: false, showExplore: false };

// Initialize user preferences from local storage
chrome.storage.sync.get(prefs, (items) => {
    prefs = items;
    initBypass();
});

// Add event listeners for configuration changes via the extension popup
chrome.storage.onChanged.addListener((changes) => {
    for (let key in changes) prefs[key] = changes[key].newValue;
    applyCSSVariables();
    executeFilters();
});

// Inject custom CSS to override default platform layout geometry
function applyCSSVariables() {
    let styleTag = document.getElementById('solenya-override');
    
    // Remove the custom stylesheet if the extension is globally disabled
    if (!prefs.enabled) {
        if (styleTag) styleTag.remove();
        return;
    }

    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'solenya-override';
        // Append stylesheet to the document head to ensure rendering priority and avoid DOM conflicts
        (document.head || document.documentElement).appendChild(styleTag);
    }
    
    // Define strict Flexbox layout rules for predictable grid scaling
    styleTag.textContent = `
        ytd-rich-grid-renderer {
            --ytd-rich-grid-items-per-row: ${prefs.gridCount} !important;
        }

        /* Main content container configured for left-aligned wrapping flex layout */
        ytd-rich-grid-renderer > #contents {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: flex-start !important; 
            width: 100% !important;
        }

        /* Neutralize intermediate row wrappers to allow direct flex child promotion */
        ytd-rich-grid-row,
        ytd-rich-grid-row > #contents {
            display: contents !important;
        }

        /* Calculate absolute width fractions for individual media containers based on user preference */
        ytd-rich-grid-renderer ytd-rich-item-renderer {
            width: calc(100% / ${prefs.gridCount} - 16px) !important;
            max-width: none !important;
            min-width: 0 !important;
            margin: 0 8px 40px 8px !important;
        }

        /* Ensure secondary structural components and continuation markers span the full viewport width */
        ytd-rich-section-renderer,
        ytd-continuation-item-renderer {
            width: 100% !important;
            flex-basis: 100% !important;
            display: block !important;
            margin: 16px 0 !important;
        }

        /* * Layout Consistency Rules: 
         * Hide dynamically injected promotional and sponsored layout containers 
         * to prevent disruption of the fractional grid mathematics.
         */
        ytd-ad-slot-renderer,
        ytd-promoted-sparkles-web-renderer,
        ytd-in-feed-ad-layout-renderer,
        ytd-banner-promo-renderer,
        ytd-statement-banner-renderer {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
        }
    `;
}

// DOM filtration sequence for specified component types
function executeFilters() {
    // SPA State Management: Re-inject the custom stylesheet if the platform's routing dynamically removes it.
    if (prefs.enabled && !document.getElementById('solenya-override')) {
        applyCSSVariables();
    }

    const shelves = document.querySelectorAll('ytd-rich-section-renderer, ytd-reel-shelf-renderer');
    
    shelves.forEach(shelf => {
        // Restore default visibility for all components if the extension is disabled
        if (!prefs.enabled) {
            shelf.style.removeProperty('display');
            return;
        }

        // Identify components via explicit structural attributes
        const isShorts = shelf.querySelector('[is-shorts], [icon="yt-icons:shorts"], ytd-reel-item-renderer');
        const isGames = shelf.querySelector('ytd-playables-shelf-renderer');
        const isPosts = shelf.querySelector('ytd-post-renderer, ytd-shared-post-renderer');
        const isExplore = shelf.querySelector('ytd-horizontal-card-list-renderer'); 

        // Fallback identification via text content analysis for dynamically rendered elements
        const textContent = (shelf.innerText || "").toLowerCase();
        const hasGamesText = textContent.includes('playables');
        const hasPostsText = textContent.includes('latest posts');
        const hasExploreText = textContent.includes('explore');

        // Apply display constraints based on user configuration
        if ((isShorts && !prefs.showShorts) || 
            ((isGames || hasGamesText) && !prefs.showGames) || 
            ((isPosts || hasPostsText) && !prefs.showPosts) ||
            ((isExplore || hasExploreText) && !prefs.showExplore)) {
            shelf.style.setProperty('display', 'none', 'important');
        } else {
            shelf.style.removeProperty('display');
        }
    });
}

function initBypass() {
    applyCSSVariables();
    
    const observer = new MutationObserver((mutations) => {
        let needsFilter = false;
        for (const mutation of mutations) {
            // Monitor for both added and removed nodes to trigger state resiliency checks
            if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                needsFilter = true;
                break;
            }
        }
        if (needsFilter) {
            executeFilters();
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
}