# WW2 Map Frontend

This directory contains all frontend assets for the WW2 Map application.

## Structure

```
frontend/
├── static/
│   └── mapapp/
│       ├── css/           # Stylesheets
│       │   ├── styles.css # Main application styles
│       │   └── modal.css  # Modal system styles
│       ├── js/            # JavaScript modules
│       │   ├── index.js   # Main application entry point
│       │   ├── timeline.js# Timeline functionality
│       │   ├── modalHandler.js # Modal management
│       │   ├── eventDisplay.js # Event display logic
│       │   ├── soldierHandler.js # Soldier management
│       │   ├── map.js     # Map utilities
│       │   ├── ai-config.js # AI configuration
│       │   └── config.js  # Dynamic configuration loader
│       └── images/        # Images and assets
│           ├── flags/     # Country flag images
│           └── soldiers/  # Soldier photos
├── templates/
│   └── mapapp/
│       └── map.html       # Main application template
└── README.md             # This file
```

## Features

- **Interactive Map**: MapLibre GL JS powered map interface with custom styling
- **Timeline Component**: Interactive historical timeline with smooth navigation
- **Responsive Design**: Mobile-optimized layouts with touch support
- **Modal System**: Advanced modal management for countries, soldiers, and events
- **AI Integration**: Gemini AI powered event descriptions and additional information
- **Search Functionality**: Real-time search for countries, soldiers, and events
- **Internationalization**: Hebrew and English support with RTL layout
- **Flag Display**: Country flags in all modals with Hebrew name support
- **Environment Configuration**: Dynamic API key loading from backend

## Key Files

### JavaScript Modules

#### Core Application
- **`index.js`** - Main application entry point, map initialization, and event coordination
- **`config.js`** - Dynamic configuration loader that fetches API keys from backend
- **`map.js`** - Map utilities and helper functions

#### User Interface
- **`timeline.js`** - Timeline functionality with smooth scrolling and event navigation
- **`modalHandler.js`** - Modal management system for all modal types
- **`eventDisplay.js`** - Event display logic and modal content management
- **`soldierHandler.js`** - Soldier profile management and search functionality

#### AI Integration
- **`ai-config.js`** - AI configuration and Gemini API integration

### CSS Files
- **`styles.css`** - Main application styles with responsive design
- **`modal.css`** - Comprehensive modal system styles with animations

### Templates
- **`map.html`** - Main application template with proper meta tags and structure

## Architecture

### Configuration Management
The frontend uses a dynamic configuration system:
1. `config.js` fetches API keys from the backend `/config/` endpoint
2. No hardcoded API keys in frontend code
3. Environment-specific configuration loaded at runtime

### Modal System
Advanced modal management with:
- Country information modals
- Soldier profile modals
- Event detail modals
- Search modals
- Responsive design for all screen sizes

### Map Integration
- MapLibre GL JS for interactive mapping
- Custom map styles and controls
- Dynamic marker management
- Responsive map sizing

### Internationalization
- Hebrew and English language support
- RTL (Right-to-Left) layout support
- Dynamic country name translation for flag display
- Localized content throughout the interface

## Development

### No Build Process Required
The frontend uses vanilla JavaScript and CSS, so no build process is required for development. Files are served directly by Django.

### File Organization
- **Modular JavaScript**: Each feature is in its own module
- **Separation of Concerns**: Clear separation between data, presentation, and interaction
- **Responsive CSS**: Mobile-first design with progressive enhancement

### Development Workflow
1. Make changes to files in `frontend/`
2. Refresh browser to see changes
3. No compilation or build step needed

### Browser Support
- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## API Integration

### Backend Endpoints Used
- `GET /config/` - Fetch API keys and configuration
- `GET /api/events/` - Historical events data
- `GET /api/soldiers/` - Soldier information
- `GET /api/countries/` - Country data
- `GET /country/english-name/<name>/` - Country name translation for flags
- `GET /soldiers/search/` - Soldier search functionality

### Error Handling
- Graceful degradation when APIs are unavailable
- User-friendly error messages
- Retry mechanisms for failed requests

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- Touch-friendly interface elements
- Optimized modal layouts for small screens
- Swipe gestures for timeline navigation
- Responsive typography and spacing

## Performance Optimizations

- **Lazy Loading**: Images and content loaded as needed
- **Efficient DOM Manipulation**: Minimal reflows and repaints
- **Optimized CSS**: Efficient selectors and minimal redundancy
- **Image Optimization**: Compressed images and appropriate formats

## Browser Console Commands

For debugging and development:
```javascript
// Access global application state
window.mapInstance
window.timelineInstance

// Debug modal system
window.modalHandler.openModal('country', countryData)

// Test configuration loading
window.configLoader.getConfig()
```

## Dependencies

### External Libraries
- **MapLibre GL JS 3.3.1** - Interactive mapping library
- **No other external dependencies** - Vanilla JavaScript implementation

### Browser APIs Used
- **Fetch API** - For HTTP requests
- **Intersection Observer** - For scroll-based animations
- **ResizeObserver** - For responsive layout adjustments
- **CSS Grid and Flexbox** - For layout management

## Accessibility

- **Semantic HTML** - Proper heading structure and landmarks
- **Keyboard Navigation** - Full keyboard accessibility
- **Screen Reader Support** - ARIA labels and descriptions
- **Color Contrast** - WCAG compliant color schemes
- **Focus Management** - Proper focus handling in modals

## Future Enhancements

- **Progressive Web App** - Service worker and offline support
- **Advanced Animations** - CSS animations and transitions
- **Touch Gestures** - Enhanced mobile interactions
- **Performance Monitoring** - Real user monitoring integration 