// Default configuration parameters for viewport and component visibility
let prefs = { enabled: true, gridCount: 6, showShorts: false, showGames: false, showPosts: false, showExplore: false, showBeta: false };

// Initialize extension state from local storage
chrome.storage.sync.get(prefs, (items) => {
    prefs = items;
    initializeLayoutManager();
});

// Add event listeners to process real-time configuration updates from the user interface
chrome.storage.onChanged.addListener((changes) => {
    for (let key in changes) prefs[key] = changes[key].newValue;
    injectLayoutGeometry();
    updateComponentVisibility();
});

// Injects dynamic CSS rules to recalculate standard platform layout constraints
function injectLayoutGeometry() {
    let styleTag = document.getElementById('solenya-override');
    
    // Remove custom styling if the extension is globally disabled
    if (!prefs.enabled) {
        if (styleTag) styleTag.remove();
        return;
    }

    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'solenya-override';
        (document.head || document.documentElement).appendChild(styleTag);
    }
    
    styleTag.textContent = `
        /* Overwrite native CSS variables defining maximum row capacity */
        ytd-rich-grid-renderer {
            --ytd-rich-grid-items-per-row: ${prefs.gridCount} !important;
        }

        /* Master Canvas Configuration: Enforce a continuous wrapping flex layout */
        ytd-rich-grid-renderer > #contents.style-scope.ytd-rich-grid-renderer {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: flex-start !important; 
            width: 100% !important;
        }

        /* Structural Normalization: Neutralize intermediary row constraints */
        ytd-rich-grid-row, 
        ytd-rich-grid-row > #contents.style-scope.ytd-rich-grid-row {
            display: contents !important;
        }

        /* Fractional Viewport Scaling: Apply user-defined column math to media items */
        ytd-rich-grid-renderer ytd-rich-item-renderer {
            width: calc(100% / ${prefs.gridCount} - 16px) !important;
            max-width: none !important;
            min-width: 0 !important;
            margin: 0 8px 40px 8px !important;
        }

        /* Shelf Formatting: Ensure secondary layout structures span the full viewport */
        ytd-rich-section-renderer,
        ytd-rich-shelf-renderer,
        ytd-continuation-item-renderer {
            width: 100% !important;
            flex-basis: 100% !important;
            display: block !important;
            margin: 0 !important;
        }

        /* Infrastructure Optimization: Suppress injected promotional nodes and empty layout spacers */
        ytd-ad-slot-renderer,
        ytd-promoted-sparkles-web-renderer,
        ytd-in-feed-ad-layout-renderer,
        ytd-banner-promo-renderer,
        ytd-statement-banner-renderer,
        ytd-rich-grid-spacer,
        ytd-ghost-grid-renderer {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            flex-basis: 0 !important;
        }
    `;
}

// Addresses layout encapsulation by enforcing flattened states across component boundaries
function normalizeDOMHierarchy() {
    if (!prefs.enabled) return;

    const rows = document.querySelectorAll('ytd-rich-grid-row');
    rows.forEach(row => {
        // Ensure the host element permits children to participate in the master flex container
        if (row.style.display !== 'contents') {
            row.style.setProperty('display', 'contents', 'important');
        }

        // Apply formatting to internal containers, accounting for Shadow DOM encapsulation
        const innerContainer = row.querySelector('#contents') || (row.shadowRoot && row.shadowRoot.querySelector('#contents'));
        if (innerContainer && innerContainer.style.display !== 'contents') {
            innerContainer.style.setProperty('display', 'contents', 'important');
        }

        // Viewport Cleanup: Collapse row structures that contain no visible active media elements
        const items = row.querySelectorAll('ytd-rich-item-renderer');
        if (items.length > 0) {
            const visibleItems = Array.from(items).filter(i => i.style.display !== 'none');
            if (visibleItems.length === 0) {
                row.style.setProperty('display', 'none', 'important');
            }
        }
    });
}

// Parses the DOM to manage the display states of dynamically loaded content categories
function updateComponentVisibility() {
    // State Verification: Re-apply layout geometry if removed by Single Page Application (SPA) routing
    if (prefs.enabled && !document.getElementById('solenya-override')) {
        injectLayoutGeometry();
    }

    // 1. Primary Shelf Component Management
    const shelves = document.querySelectorAll('ytd-rich-section-renderer, ytd-reel-shelf-renderer, ytd-rich-shelf-renderer');
    shelves.forEach(shelf => {
        // Revert to platform defaults if extension is globally disabled
        if (!prefs.enabled) {
            shelf.style.removeProperty('display');
            return;
        }

        // Element Identification via explicit structural markers
        const isShorts = shelf.querySelector('[is-shorts], [icon="yt-icons:shorts"], ytd-reel-item-renderer');
        const isGames = shelf.querySelector('ytd-playables-shelf-renderer');
        const isPosts = shelf.querySelector('ytd-post-renderer, ytd-shared-post-renderer');
        const isExplore = shelf.querySelector('ytd-horizontal-card-list-renderer'); 
        const isBeta = shelf.querySelector('ytd-talk-to-recs-flow-renderer');
        const isPremiumPromo = shelf.querySelector('ytd-statement-banner-renderer');

        // Element Identification via fallback text parsing for obfuscated components
        const textContent = (shelf.innerText || "").toLowerCase();
        const hasExploreText = textContent.includes('explore') || textContent.includes('mixes') || 
                               textContent.includes('for you') || textContent.includes('keep watching') ||
                               textContent.includes('custom feed') || textContent.includes('premium');
        const hasBetaText = textContent.includes('ask for videos any way you like');

        // Apply visibility rules based on user preferences
        if ((isShorts && !prefs.showShorts) || 
            ((isGames || textContent.includes('playables')) && !prefs.showGames) || 
            ((isPosts || textContent.includes('latest posts')) && !prefs.showPosts) ||
            ((isExplore || isPremiumPromo || hasExploreText) && !prefs.showExplore) ||
            ((isBeta || hasBetaText) && !prefs.showBeta)) {
            shelf.style.setProperty('display', 'none', 'important');
        } else {
            shelf.style.removeProperty('display');
        }
    });

    // 2. Standard Media Container Management (Validation of Active Elements)
    if (prefs.enabled) {
        const gridItems = document.querySelectorAll('ytd-rich-item-renderer');
        gridItems.forEach(item => {
            // Require standard anchor tags to verify the container holds accessible media
            const hasValidAnchor = item.querySelector('a');
            const isAdPlacement = item.querySelector('ytd-ad-slot-renderer, ytd-in-feed-ad-layout-renderer');
            const isStandalonePost = !prefs.showPosts && item.querySelector('ytd-post-renderer, ytd-shared-post-renderer');
            const isStandaloneShort = !prefs.showShorts && item.querySelector('ytd-rich-grid-slim-media');

            // Suppress the display of invalid containers, ad layouts, or user-restricted standalone formats
            if (!hasValidAnchor || isAdPlacement || isStandalonePost || isStandaloneShort) {
                item.style.setProperty('display', 'none', 'important');
            } else {
                item.style.removeProperty('display');
            }
        });
    }

    // Execute structural flattening to finalize layout execution
    normalizeDOMHierarchy();
}

// Core initialization and mutation observer setup
function initializeLayoutManager() {
    injectLayoutGeometry();
    
    // Monitor the DOM for dynamic content injections (infinite scroll/lazy loading)
    const observer = new MutationObserver((mutations) => {
        let requiresStateUpdate = false;
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                requiresStateUpdate = true;
                break;
            }
        }
        if (requiresStateUpdate) {
            updateComponentVisibility();
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    
    // Perform an immediate synchronization pass upon initialization
    updateComponentVisibility();
}