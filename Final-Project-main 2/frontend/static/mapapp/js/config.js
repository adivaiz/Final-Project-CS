// Frontend configuration - loads from template context
let CONFIG = {
    MAPTILER_API_KEY: '',
    GEMINI_API_KEY: '',
    DEBUG: false,
    loaded: false
};

// Function to load configuration from template context
async function loadConfig() {
    if (CONFIG.loaded) {
        return CONFIG;
    }
    
    // Load from global window configuration (set in template)
    if (window.WW2_CONFIG) {
        CONFIG.MAPTILER_API_KEY = window.WW2_CONFIG.MAPTILER_API_KEY || '';
        CONFIG.GEMINI_API_KEY = window.WW2_CONFIG.GEMINI_API_KEY || '';
        CONFIG.DEBUG = window.WW2_CONFIG.DEBUG || false;
        CONFIG.loaded = true;
        console.log('✅ Configuration loaded from template context');
        
        // Check if API keys are available
        if (!CONFIG.MAPTILER_API_KEY) {
            console.warn('⚠️ MAPTILER_API_KEY not found in template configuration');
        }
        if (!CONFIG.GEMINI_API_KEY) {
            console.warn('⚠️ GEMINI_API_KEY not found in template configuration');
        }
    } else {
        console.error('❌ WW2_CONFIG not found in template context');
    }
    
    return CONFIG;
}

// Export for use in other modules
export { CONFIG, loadConfig }; 