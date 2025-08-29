// AI Configuration - now loads from backend environment variables
import { CONFIG, loadConfig } from './config.js';

export const GEMINI_CONFIG = {
    get API_KEY() {
        return CONFIG.GEMINI_API_KEY;
    },
    API_URL: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent'
};

// Initialize configuration on module load
loadConfig();

