// Siteminder Booking Engine Integration Script
window.SiteminderBooking = (function() {
    'use strict';
    
    let config = {
        bookingUrl: '',
        buttonText: 'Book Now',
        buttonColor: '#4299e1',
        headerColor: '#2d3748'
    };
    
    let initialized = false;
    
    // Get configuration from script tag data attributes
    function getConfigFromScript() {
        // Try multiple ways to find the script
        let script = document.currentScript;
        
        if (!script) {
            // Fallback: look for script with data-booking-url
            script = document.querySelector('script[data-booking-url]');
        }
        
        if (!script) {
            // Fallback: look for script with siteminder in src
            const scripts = document.querySelectorAll('script[src*="siteminder-booking"]');
            if (scripts.length > 0) {
                script = scripts[scripts.length - 1];
            }
        }
        
        if (script) {
            return {
                bookingUrl: script.getAttribute('data-booking-url') || '',
                buttonText: script.getAttribute('data-button-text') || 'Book Now',
                buttonColor: script.getAttribute('data-button-color') || '#4299e1',
                headerColor: script.getAttribute('data-header-color') || '#2d3748'
            };
        }
        
        return {};
    }
    
    // Helper function to adjust color brightness
    function adjustColor(color, percent) {
        const f = parseInt(color.slice(1), 16);
        const t = percent < 0 ? 0 : 255;
        const p = percent < 0 ? percent * -1 : percent;
        const R = f >> 16;
        const G = f >> 8 & 0x00FF;
        const B = f & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((t - R) * p / 100) + R) * 0x10000 + 
               (Math.round((t - G) * p / 100) + G) * 0x100 + 
               (Math.round((t - B) * p / 100) + B)).toString(16).slice(1);
    }
    
    // Create and inject CSS styles
    function injectStyles() {
        const styles = `
            .siteminder-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                z-index: 10000;
                display: flex;
                justify-content: flex-end;
                align-items: flex-end;
                padding: 20px;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                box-sizing: border-box;
            }
            
            .siteminder-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .siteminder-popup {
                width: 400px;
                height: 720px;
                max-width: calc(100vw - 40px);
                max-height: calc(100vh - 40px);
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                transform: translateX(100%) translateY(20px);
                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                display: flex;
                flex-direction: column;
            }
            
            .siteminder-overlay.active .siteminder-popup {
                transform: translateX(0) translateY(0);
            }
            
            .siteminder-header {
                background: ${config.headerColor};
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
            }
            
            .siteminder-title {
                font-size: 18px;
                font-weight: 600;
                margin: 0;
            }
            
            .siteminder-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s ease;
            }
            
            .siteminder-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .siteminder-iframe {
                flex: 1;
                border: none;
                width: 100%;
            }
            
            .siteminder-book-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: ${config.buttonColor};
                color: white;
                padding: 15px 20px;
                border: none;
                border-radius: 50px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 20px rgba(66, 153, 225, 0.4);
                z-index: 9999;
                white-space: nowrap;
            }
            
            .siteminder-book-btn:hover {
                background: ${adjustColor(config.buttonColor, -20)};
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 8px 25px rgba(66, 153, 225, 0.5);
            }
            
            .siteminder-book-btn .btn-icon {
                font-size: 18px;
            }
            
            .siteminder-book-btn .btn-text {
                font-size: 14px;
            }
            
            @media (max-width: 768px) {
                .siteminder-overlay {
                    padding: 15px;
                }
                
                .siteminder-popup {
                    width: 100%;
                    max-width: calc(100vw - 30px);
                    height: 70vh;
                    max-height: calc(100vh - 30px);
                }
                
                .siteminder-book-btn {
                    bottom: 15px;
                    right: 15px;
                    padding: 12px 16px;
                    font-size: 14px;
                }
                
                .siteminder-book-btn .btn-text {
                    font-size: 12px;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // Create floating button
    function createFloatingButton() {
        const button = document.createElement('button');
        button.className = 'siteminder-book-btn';
        button.innerHTML = `
            <span class="btn-icon">🏨</span>
            <span class="btn-text">${config.buttonText}</span>
        `;
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openBookingEngine();
        });
        
        document.body.appendChild(button);
    }
    
    // Create overlay and popup
    function createOverlay() {
        const overlayHTML = `
            <div id="siteminder-overlay" class="siteminder-overlay">
                <div class="siteminder-popup">
                    <div class="siteminder-header">
                        <h3 class="siteminder-title">Book Your Stay</h3>
                        <button class="siteminder-close" aria-label="Close">&times;</button>
                    </div>
                    <iframe class="siteminder-iframe" src="" title="Booking Engine"></iframe>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
        
        const overlay = document.getElementById('siteminder-overlay');
        const closeBtn = overlay.querySelector('.siteminder-close');
        const header = overlay.querySelector('.siteminder-header');
        const iframe = overlay.querySelector('.siteminder-iframe');
        
        // Set header color
        header.style.background = config.headerColor;
        
        // Close overlay function
        function closeOverlay() {
            overlay.classList.remove('active');
            setTimeout(() => {
                iframe.src = '';
            }, 300);
        }
        
        // Event listeners
        closeBtn.addEventListener('click', closeOverlay);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeOverlay();
            }
        });
        
        // ESC key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeOverlay();
            }
        });
        
        // Store references
        window.siteminderOverlay = overlay;
        window.siteminderIframe = iframe;
    }
    
    // Open booking engine
    function openBookingEngine() {
        if (!config.bookingUrl) {
            console.error('Booking URL not configured. Please add data-booking-url to your script tag or call SiteminderBooking.init().');
            return;
        }
        
        const separator = config.bookingUrl.includes('?') ? '&' : '?';
        const mobileUrl = config.bookingUrl + separator + 'mobile=1';
        
        window.siteminderIframe.src = mobileUrl;
        window.siteminderOverlay.classList.add('active');
    }
    
    // Initialize function
    function init(options = {}) {
        if (initialized) return; // Prevent double initialization
        
        // Merge script data attributes, then manual options
        const scriptConfig = getConfigFromScript();
        config = Object.assign(config, scriptConfig, options);
        
        if (!config.bookingUrl) {
            console.error('SiteminderBooking: bookingUrl is required. Add data-booking-url to script tag or provide in init().');
            return;
        }
        
        initialized = true;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                injectStyles();
                createOverlay();
                createFloatingButton();
            });
        } else {
            injectStyles();
            createOverlay();
            createFloatingButton();
        }
    }
    
    // Auto-initialize when script loads
    function autoInit() {
        const scriptConfig = getConfigFromScript();
        console.log('Script config found:', scriptConfig); // Debug log
        if (scriptConfig.bookingUrl) {
            console.log('Auto-initializing with URL:', scriptConfig.bookingUrl); // Debug log
            init(scriptConfig);
        } else {
            console.log('No booking URL found in script attributes'); // Debug log
        }
    }
    
    // Auto-initialize immediately and on DOM ready
    autoInit();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    }
    
    // Public API
    return {
        init: init,
        open: openBookingEngine
    };
})();