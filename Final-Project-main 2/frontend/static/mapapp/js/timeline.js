import { GEMINI_CONFIG } from './ai-config.js';

// Global variables to manage modal state
let isEventModalOpen = false;
let isZoomingToEvent = false;
let currentEventModal = null;
let isLoadingAI = false;
let eventsWithAIOutput = new Set(); // Track events that have shown AI output

// Function to show default timeline content when no events are available
function showDefaultTimelineContent(container, currentLang) {
    container.innerHTML = '';
    container.className = 'timeline-list';
    
    // Header
    const header = document.createElement('div');
    header.className = 'timeline-list-header';
    const headerTitle = currentLang === 'he' ? 'ציר הזמן של מלחמת העולם השנייה' : 'World War II Timeline';
    const headerInstruction = currentLang === 'he' ? 'אירועים מרכזיים במלחמת העולם השנייה' : 'Major events of World War II';
    header.innerHTML = `<h2>${headerTitle}</h2><div class="timeline-instruction">${headerInstruction}</div>`;
    container.appendChild(header);
    
    // Default timeline events
    const defaultEvents = currentLang === 'he' ? [
        { year: '1939', title: 'פלישה לפולין', description: 'גרמניה פולשת לפולין - תחילת המלחמה' },
        { year: '1940', title: 'קרב על בריטניה', description: 'הלופטוואפה תוקפת את בריטניה' },
        { year: '1941', title: 'פלישה לברית המועצות', description: 'מבצע ברברוסה - פלישת גרמניה לרוסיה' },
        { year: '1941', title: 'פרל הארבור', description: 'יפן תוקפת את פרל הארבור' },
        { year: '1942', title: 'קרב על סטלינגרד', description: 'נקודת המפנה במלחמה' },
        { year: '1943', title: 'כניעת איטליה', description: 'איטליה נכנעת לבעלות הברית' },
        { year: '1944', title: 'פלישת נורמנדי', description: 'יום ה-D - פתיחת החזית השנייה' },
        { year: '1945', title: 'כניעת גרמניה', description: 'סיום המלחמה באירופה' },
        { year: '1945', title: 'הפצצות הירושימה ונגסקי', description: 'שימוש בנשק גרעיני' },
        { year: '1945', title: 'כניעת יפן', description: 'סיום מלחמת העולם השנייה' }
    ] : [
        { year: '1939', title: 'Invasion of Poland', description: 'Germany invades Poland - War begins' },
        { year: '1940', title: 'Battle of Britain', description: 'Luftwaffe attacks Britain' },
        { year: '1941', title: 'Invasion of Soviet Union', description: 'Operation Barbarossa - Germany invades Russia' },
        { year: '1941', title: 'Pearl Harbor', description: 'Japan attacks Pearl Harbor' },
        { year: '1942', title: 'Battle of Stalingrad', description: 'Turning point of the war' },
        { year: '1943', title: 'Italy Surrenders', description: 'Italy surrenders to the Allies' },
        { year: '1944', title: 'D-Day Normandy', description: 'D-Day - Opening of second front' },
        { year: '1945', title: 'Germany Surrenders', description: 'End of war in Europe' },
        { year: '1945', title: 'Hiroshima and Nagasaki', description: 'Use of nuclear weapons' },
        { year: '1945', title: 'Japan Surrenders', description: 'End of World War II' }
    ];
    
    // Create timeline cards for default events
    defaultEvents.forEach(event => {
        const card = document.createElement('div');
        card.className = 'timeline-card timeline-event-card';
        card.innerHTML = `
            <div class="timeline-card-title">${event.title}</div>
            <div class="timeline-card-date">${event.year}</div>
            <div class="timeline-card-description">${event.description}</div>
        `;
        
        // Add click handler for default events
        card.addEventListener('click', () => {
            const infoText = currentLang === 'he' ? 
                'זהו תוכן ברירת מחדל. לצפייה באירועים מפורטים, נא לטעון את בסיס הנתונים.' :
                'This is default content. For detailed events, please load the database.';
            alert(infoText);
        });
        
        container.appendChild(card);
    });
}

export function initializeTimeline(map) {
    const timelineContainer = document.getElementById('timeline-events');
    
    // Get current language
    const currentLang = document.documentElement.lang || 'he';
    
    // עיצוב חדש: רשימה אנכית עם גלילה
    timelineContainer.innerHTML = '';
    timelineContainer.classList.add('timeline-list');
    
    // Add language parameter to the API call
    const apiUrl = currentLang === 'he' ? "/events/?lang=he" : "/events/?lang=en";
    
    // טוען אירועים מהשרת
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(events => {
            if (!Array.isArray(events) || events.length === 0) {
                const noEventsMessage = currentLang === 'he' ? "לא התקבלו אירועים מהשרת" : "No events received from server";
                throw new Error(noEventsMessage);
            }
            // קיבוץ לפי שנה
            const validEvents = events.filter(event => event.title && event.date);
            const eventsByYear = {};
            validEvents.forEach(event => {
                const year = new Date(event.date).getFullYear();
                if (!eventsByYear[year]) eventsByYear[year] = [];
                eventsByYear[year].push(event);
            });
            const years = Object.keys(eventsByYear).sort((a, b) => parseInt(a) - parseInt(b));
            createYearCards(years, eventsByYear, timelineContainer, map, currentLang);
        })
        .catch(error => {
            console.error('Timeline error:', error);
            // Show default timeline content instead of error
            showDefaultTimelineContent(timelineContainer, currentLang);
        });
}

function createYearCards(years, eventsByYear, container, map, currentLang) {
    container.innerHTML = '';
    container.className = 'timeline-list';
    
    // כותרת - bilingual
    const header = document.createElement('div');
    header.className = 'timeline-list-header';
    const headerTitle = currentLang === 'he' ? 'בחר שנה' : 'Select Year';
    const headerInstruction = currentLang === 'he' ? 'לחץ על שנה לצפייה באירועים' : 'Click on a year to view events';
    header.innerHTML = `<h2>${headerTitle}</h2><div class="timeline-instruction">${headerInstruction}</div>`;
    container.appendChild(header);
    
    // רשימת שנים
    years.forEach(year => {
        const card = document.createElement('div');
        card.className = 'timeline-card timeline-year-card';
        const eventsText = currentLang === 'he' ? 'אירועים' : 'events';
        
        // Set tooltip attributes for CSS hover effects
        const clickTooltip = currentLang === 'he' ? `לחץ לצפייה ב-${year}` : `Click to view ${year}`;
        const eventsCountText = `${eventsByYear[year].length} ${eventsText}`;
        card.setAttribute('data-tooltip', clickTooltip);
        card.setAttribute('data-events-text', eventsCountText);
        
        card.innerHTML = `<div class="timeline-card-title">${year}</div><div class="timeline-card-sub">${eventsByYear[year].length} ${eventsText}</div>`;
        card.addEventListener('click', () => {
            createEventCards(year, eventsByYear[year], container, map, currentLang, () => createYearCards(years, eventsByYear, container, map, currentLang));
        });
        container.appendChild(card);
    });
}

function createEventCards(year, events, container, map, currentLang, backCallback) {
    container.innerHTML = '';
    container.className = 'timeline-list';
    
    // כותרת + כפתור חזרה - bilingual
    const header = document.createElement('div');
    header.className = 'timeline-list-header';
    const yearTitle = currentLang === 'he' ? `אירועי ${year}` : `Events of ${year}`;
    const yearInstruction = currentLang === 'he' ? 'לחץ על אירוע למעבר במפה' : 'Click on an event to navigate on the map';
    header.innerHTML = `<h2>${yearTitle}</h2><div class="timeline-instruction">${yearInstruction}</div>`;
    container.appendChild(header);
    
    const backBtn = document.createElement('button');
    backBtn.className = 'timeline-back-btn';
    backBtn.textContent = currentLang === 'he' ? 'חזרה לשנים' : 'Back to Years';
    backBtn.onclick = backCallback;
    container.appendChild(backBtn);
    
    // אין אירועים
    if (!events || events.length === 0) {
        const noEvents = document.createElement('div');
        noEvents.className = 'timeline-no-events';
        const noEventsText = currentLang === 'he' ? 'לא נמצאו אירועים לשנה זו' : 'No events found for this year';
        noEvents.textContent = noEventsText;
        container.appendChild(noEvents);
        return;
    }
    
    // רשימת אירועים
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'timeline-card timeline-event-card';
        card.innerHTML = `<div class="timeline-card-title">${event.title}</div><div class="timeline-card-date">${formatDate(event.date, currentLang)}</div>`;
        
        // Remove hover effects and only allow one click
        let hasBeenClicked = false;
        
        card.addEventListener('click', () => {
            // Prevent multiple clicks if already clicked or modal is open
            if (hasBeenClicked || isZoomingToEvent || isEventModalOpen) {
                return;
            }
            
            // Mark as clicked
            hasBeenClicked = true;
            
            // Set flag to prevent additional clicks
            isZoomingToEvent = true;
            
            // Close any existing modal first
            if (currentEventModal) {
                closeCurrentModal();
            }
            
            // Add visual feedback to clicked card
            card.style.opacity = '0.7';
            card.style.transform = 'scale(0.95)';
            
            let lat = event.latitude, lng = event.longitude;
            if ((!lat || !lng) && event.country) {
                lat = event.country.latitude;
                lng = event.country.longitude;
            }
            if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                // Show event modal immediately
                showEventModal(event, currentLang);
                isZoomingToEvent = false;
                // Reset card appearance
                card.style.opacity = '';
                card.style.transform = '';

                // Zoom to location in parallel
                map.flyTo({ 
                    center: [lng, lat], 
                    zoom: 5, 
                    duration: 2000 
                });
            } else {
                // Show event modal immediately
                showEventModal(event, currentLang);
                isZoomingToEvent = false;
                // Reset card appearance
                card.style.opacity = '';
                card.style.transform = '';

                // Default zoom in parallel
                map.flyTo({ 
                    center: [31.0461, 34.8516], 
                    zoom: 3, 
                    duration: 2000 
                });
            }
        });
        container.appendChild(card);
    });
}

// Function to close current modal if exists
function closeCurrentModal() {
    if (currentEventModal) {
        const overlay = currentEventModal;
        const content = overlay.querySelector('.timeline-event-modal-content');
        const isMobile = window.innerWidth <= 768;
        
        overlay.style.opacity = '0';
        if (isMobile) {
            content.style.transform = 'translateX(50%) translateY(100%)';
        } else {
            content.style.transform = 'translateX(100%)';
        }
        
        setTimeout(() => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
            currentEventModal = null;
            isEventModalOpen = false;
        }, 400);
    }
}

// Function to get additional information from Gemini AI
async function getAIInformation(event, currentLang) {
    if (!GEMINI_CONFIG.API_KEY || GEMINI_CONFIG.API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        return {
            success: false,
            error: currentLang === 'he' ? 'API Key לא הוגדר' : 'API Key not configured'
        };
    }

    try {
        // Prepare the prompt for Gemini
        const eventTitle = event.title || 'Unknown Event';
        const eventDescription = event.description || 'No description available';
        const eventDate = event.date ? formatDate(event.date, currentLang) : 'Unknown date';
        const countryName = event.country ? (event.country.name || event.country.name_he || 'Unknown') : 'Unknown';
        
        const prompt = currentLang === 'he' ? 
            `תן לי מידע נוסף מעניין והסטורי על האירוע הבא ממלחמת העולם השנייה:
כותרת: ${eventTitle}
תאריך: ${eventDate}
מדינה: ${countryName}
תיאור: ${eventDescription}

אנא ספק מידע נוסף מעניין, הקשר היסטורי, השלכות, ופרטים שלא מוזכרים בתיאור הבסיסי. תכתב בעברית ובאורך של 2-3 פסקאות.` :
            `Provide me with additional interesting and historical information about this World War II event:
Title: ${eventTitle}
Date: ${eventDate}
Country: ${countryName}
Description: ${eventDescription}

Please provide additional interesting information, historical context, consequences, and details not mentioned in the basic description. Write in English in 2-3 paragraphs.`;

        // Try multiple API URLs in case one doesn't work
        const apiUrls = [
            `${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`,
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_CONFIG.API_KEY}`,
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_CONFIG.API_KEY}`
        ];

        let response = null;
        let lastError = null;

        for (const apiUrl of apiUrls) {
            try {
                console.log(`Trying API URL: ${apiUrl.replace(GEMINI_CONFIG.API_KEY, 'HIDDEN_KEY')}`);
                
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }]
                    })
                });

                if (response.ok) {
                    console.log('API call successful!');
                    break; // Success! Exit the loop
                } else {
                    lastError = `HTTP error! status: ${response.status}`;
                    console.warn(`API URL failed with status ${response.status}: ${apiUrl.replace(GEMINI_CONFIG.API_KEY, 'HIDDEN_KEY')}`);
                    response = null; // Reset for next iteration
                }
            } catch (err) {
                lastError = err.message;
                console.warn(`API URL failed with error: ${err.message}`);
                response = null; // Reset for next iteration
            }
        }

        if (!response || !response.ok) {
            throw new Error(lastError || `HTTP error! status: ${response?.status || 'unknown'}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            return {
                success: true,
                text: data.candidates[0].content.parts[0].text
            };
        } else {
            throw new Error('Invalid response format from Gemini API');
        }

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return {
            success: false,
            error: currentLang === 'he' ? 
                `שגיאה בקבלת מידע מ-AI: ${error.message}` : 
                `Error getting AI information: ${error.message}`
        };
    }
}

// New function to show event modal after zoom
export function showEventModal(event, currentLang) {
    // Set modal state
    isEventModalOpen = true;
    
    // Create modal overlay (lighter and only covers part of screen)
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'timeline-event-modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.2);
        z-index: 3000;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: auto;
    `;
    
    // Create modal content (side panel)
    const modalContent = document.createElement('div');
    modalContent.className = 'timeline-event-modal-content';
    
    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    const panelWidth = isMobile ? '90%' : '350px';
    const panelHeight = isMobile ? '50vh' : '100vh';
    const panelPosition = isMobile ? 'bottom: 0; right: 50%; transform: translateX(50%) translateY(100%);' : 'top: 0; right: 0; transform: translateX(100%);';
    const borderRadius = isMobile ? '15px 15px 0 0' : '15px 0 0 15px';
    
    modalContent.style.cssText = `
        background: linear-gradient(145deg, #f5e6d3 0%, #f9ede1 50%, #f5e6d3 100%);
        border-radius: ${borderRadius};
        padding: 20px;
        width: ${panelWidth};
        height: ${panelHeight};
        position: fixed;
        ${panelPosition}
        overflow-y: auto;
        box-shadow: ${isMobile ? '0 -5px 20px rgba(75, 46, 46, 0.3)' : '-5px 0 20px rgba(75, 46, 46, 0.3)'};
        border-${isMobile ? 'top' : 'left'}: 3px solid #bfae9e;
        color: #4b2e2e;
        transition: transform 0.4s ease;
        z-index: 3001;
    `;
    
    // Format date for display
    const eventDate = formatDate(event.date, currentLang);
    const countryName = event.country ? (event.country.name || event.country.name_he || 'Unknown') : 'Unknown';
    
    // Modal content HTML (compact side panel design)
    modalContent.innerHTML = `
        <button class="timeline-event-modal-close" style="
            position: absolute;
            top: 10px;
            left: 10px;
            background: #e74c3c;
            color: #fff;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        ">×</button>
        
        <div class="timeline-event-header" style="margin-top: 45px; margin-bottom: 25px;">
            <h2 style="
                color: #4b2e2e; 
                margin: 0 0 20px 0; 
                font-size: 1.6rem; 
                font-weight: bold; 
                line-height: 1.4;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                border-bottom: 2px solid #bfae9e;
                padding-bottom: 15px;
            ">
                ${event.title}
            </h2>
            <div style="
                color: #8B4513; 
                font-size: 1.1rem; 
                margin-bottom: 12px; 
                display: flex; 
                align-items: center;
                font-weight: 500;
                padding: 8px 12px;
                background: rgba(139, 69, 19, 0.1);
                border-radius: 8px;
            ">
                <span style="margin-left: 8px; font-size: 1.2rem;"></span> ${eventDate}
            </div>
            <div style="
                color: #8B4513; 
                font-size: 1rem; 
                opacity: 0.9; 
                display: flex; 
                align-items: center;
                font-weight: 500;
                padding: 8px 12px;
                background: rgba(139, 69, 19, 0.08);
                border-radius: 8px;
            ">
                <span style="margin-left: 8px; font-size: 1.1rem;"></span> ${countryName}
            </div>
        </div>
        
        <div class="timeline-event-body" style="font-size: 1rem;">
            ${event.description ? `
                <div style="margin-bottom: 25px;">
                    <h3 style="
                        color: #4b2e2e; 
                        margin: 0 0 15px 0; 
                        font-size: 1.3rem; 
                        font-weight: bold;
                        border-bottom: 1px solid #bfae9e;
                        padding-bottom: 8px;
                    ">
                        ${currentLang === 'he' ? 'תיאור האירוע' : 'Event Description'}
                    </h3>
                    <div style="
                        line-height: 1.7; 
                        color: #4b2e2e; 
                        font-size: 1rem; 
                        max-height: 180px; 
                        overflow-y: auto;
                        padding: 15px;
                        background: rgba(245, 230, 211, 0.3);
                        border-radius: 10px;
                        border-left: 4px solid #8B4513;
                        text-align: justify;
                        text-justify: inter-word;
                    ">
                        ${event.description}
                    </div>
                </div>
            ` : ''}
            
            ${event.casualties ? `
                <div style="margin-bottom: 20px;">
                    <h3 style="
                        color: #4b2e2e; 
                        margin: 0 0 12px 0; 
                        font-size: 1.2rem; 
                        font-weight: bold;
                        border-bottom: 1px solid #bfae9e;
                        padding-bottom: 8px;
                    ">
                        ${currentLang === 'he' ? 'נפגעים' : 'Casualties'}
                    </h3>
                    <div style="
                        color: #e74c3c; 
                        font-weight: bold; 
                        font-size: 1.05rem;
                        padding: 12px 15px;
                        background: rgba(231, 76, 60, 0.1);
                        border-radius: 8px;
                        border-left: 4px solid #e74c3c;
                    ">
                        ${event.casualties}
                    </div>
                </div>
            ` : ''}
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #bfae9e;">
                <button class="ai-learn-more" style="
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 15px;
                    cursor: pointer;
                    font-size: 0.75rem;
                    font-weight: normal;
                    transition: all 0.3s ease;
                    width: 100%;
                    margin-bottom: 8px;
                    box-shadow: 0 1px 3px rgba(102, 126, 234, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                ">
                    <span style="font-size: 0.8rem;">🤖</span>
                    <span>${currentLang === 'he' ? 'קרא עוד עם AI' : 'Learn more with AI'}</span>
                </button>
                
                <button class="view-country-details" style="
                    background: #8B4513;
                    color: #f5e6d3;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    width: 100%;
                    box-shadow: 0 2px 4px rgba(139, 69, 19, 0.3);
                ">
                    ${currentLang === 'he' ? `צפה בפרטים על ${countryName}` : `View ${countryName} details`}
                </button>
            </div>
            
            <!-- AI Response Section (hidden by default) -->
            <div class="ai-response-section" style="
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #bfae9e;
                display: none;
            ">
                <div class="ai-response-header" style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 10px;
                    padding: 6px 10px;
                    background: linear-gradient(90deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));
                    border-radius: 6px;
                    border-left: 2px solid #667eea;
                ">
                    <span style="
                        font-size: 0.9rem;
                        filter: drop-shadow(0 1px 2px rgba(102, 126, 234, 0.2));
                    ">🤖</span>
                    <h4 style="
                        margin: 0; 
                        color: #666; 
                        font-size: 0.85rem;
                        font-weight: 500;
                        text-shadow: none;
                    ">
                        ${currentLang === 'he' ? 'מידע נוסף מ-AI' : 'Additional AI Information'}
                    </h4>
                </div>
                <div class="ai-response-content" style="
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 8px;
                    border: 1px solid rgba(102, 126, 234, 0.15);
                    border-left: 2px solid #667eea;
                    max-height: 250px;
                    overflow-y: auto;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.5;
                    font-size: 0.85rem;
                    box-shadow: 0 1px 4px rgba(102, 126, 234, 0.08);
                ">
                    <!-- AI response will be inserted here -->
                </div>
            </div>
        </div>
    `;
    
    // Add modal to DOM
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Store reference to current modal
    currentEventModal = modalOverlay;
    
    // Show modal with slide-in animation
    setTimeout(() => {
        modalOverlay.style.opacity = '1';
        if (isMobile) {
            modalContent.style.transform = 'translateX(50%) translateY(0)';
        } else {
            modalContent.style.transform = 'translateX(0)';
        }
    }, 10);
    
    // Close modal handlers
    const closeModal = () => {
        modalOverlay.style.opacity = '0';
        if (isMobile) {
            modalContent.style.transform = 'translateX(50%) translateY(100%)';
        } else {
            modalContent.style.transform = 'translateX(100%)';
        }
        setTimeout(() => {
            if (modalOverlay.parentNode) {
                document.body.removeChild(modalOverlay);
            }
            // Reset modal state
            currentEventModal = null;
            isEventModalOpen = false;
        }, 400);
    };
    
    // Close button
    modalContent.querySelector('.timeline-event-modal-close').addEventListener('click', closeModal);
    
    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // AI Learn More button
    const aiBtn = modalContent.querySelector('.ai-learn-more');
    const aiSection = modalContent.querySelector('.ai-response-section');
    const aiContent = modalContent.querySelector('.ai-response-content');
    
    if (aiBtn) {
        // Check if this event has already shown AI output
        const eventKey = `${event.id || event.title}-${event.date}`;
        const hasShownAI = eventsWithAIOutput.has(eventKey);
        
        // If AI output was already shown, hide the button and show the section
        if (hasShownAI) {
            aiBtn.style.display = 'none';
            aiSection.style.display = 'block';
        }
        
        aiBtn.addEventListener('click', async () => {
            // Prevent multiple AI requests
            if (isLoadingAI) return;
            
            // If AI output was already shown, don't proceed
            if (hasShownAI) return;
            
            isLoadingAI = true;
            
            // Update button to show loading state
            aiBtn.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="
                        width: 16px; 
                        height: 16px; 
                        border: 2px solid #ffffff; 
                        border-top: 2px solid transparent; 
                        border-radius: 50%; 
                        animation: spin 1s linear infinite;
                    "></div>
                    <span>${currentLang === 'he' ? 'טוען מ-AI...' : 'Loading from AI...'}</span>
                </div>
            `;
            aiBtn.style.pointerEvents = 'none';
            
            // Add spinning animation to the document if it doesn't exist
            if (!document.querySelector('#ai-spinner-style')) {
                const style = document.createElement('style');
                style.id = 'ai-spinner-style';
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Show AI section and add loading message with enhanced animation
            aiSection.style.display = 'block';
            aiContent.innerHTML = `
                <div style="
                    text-align: center; 
                    padding: 30px 20px; 
                    color: #667eea;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
                    border-radius: 10px;
                ">
                    <div style="
                        font-size: 2rem; 
                        margin-bottom: 15px;
                        animation: pulse 2s infinite;
                    ">🤖</div>
                    <div style="
                        font-size: 1rem;
                        font-weight: 500;
                        margin-bottom: 10px;
                        color: #4a5568;
                    ">${currentLang === 'he' ? 'AI חושב ומחפש מידע נוסף...' : 'AI is thinking and searching for additional information...'}</div>
                    <div style="
                        font-size: 0.85rem;
                        color: #718096;
                        font-style: italic;
                    ">${currentLang === 'he' ? 'זה ייקח כמה שניות' : 'This will take a few seconds'}</div>
                </div>
            `;
            
            // Add AI styles if not exists
            if (!document.querySelector('#ai-enhanced-styles')) {
                const style = document.createElement('style');
                style.id = 'ai-enhanced-styles';
                style.textContent = `
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.1); opacity: 0.7; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    
                    .ai-response-content::-webkit-scrollbar {
                        width: 6px;
                    }
                    
                    .ai-response-content::-webkit-scrollbar-track {
                        background: rgba(102, 126, 234, 0.1);
                        border-radius: 3px;
                    }
                    
                    .ai-response-content::-webkit-scrollbar-thumb {
                        background: linear-gradient(45deg, #667eea, #764ba2);
                        border-radius: 3px;
                    }
                    
                    .ai-response-content::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(45deg, #5a67d8, #6b46c1);
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Get AI information
            const aiResult = await getAIInformation(event, currentLang);
            
            // Update content based on result
            if (aiResult.success) {
                // Format the AI response with better styling
                const formattedText = aiResult.text
                    .split('\n')
                    .map(paragraph => paragraph.trim())
                    .filter(paragraph => paragraph.length > 0)
                    .map((paragraph, index) => {
                        // Style first paragraph differently as introduction
                        if (index === 0) {
                            return `<p style="
                                margin: 0 0 12px 0; 
                                line-height: 1.6; 
                                font-size: 0.9rem;
                                color: #2d3748;
                                font-weight: 500;
                                text-align: justify;
                                text-justify: inter-word;
                            ">${paragraph}</p>`;
                        }
                        // Regular paragraphs
                        return `<p style="
                            margin: 0 0 10px 0; 
                            line-height: 1.5; 
                            font-size: 0.85rem;
                            color: #4a5568;
                            text-align: justify;
                            text-justify: inter-word;
                        ">${paragraph}</p>`;
                    })
                    .join('');
                
                // Add AI signature at the end
                const aiSignature = `
                    <div style="
                        margin-top: 15px;
                        padding-top: 8px;
                        border-top: 1px solid rgba(102, 126, 234, 0.15);
                        text-align: center;
                        font-size: 0.7rem;
                        color: #999;
                        font-style: italic;
                    ">
                        🤖 ${currentLang === 'he' ? 'מידע נוסף באדיבות Gemini AI' : 'Additional information courtesy of Gemini AI'}
                    </div>
                `;
                
                aiContent.innerHTML = formattedText + aiSignature;
                
                // Mark this event as having shown AI output
                eventsWithAIOutput.add(eventKey);
                
                // Hide the button after successful AI response
                aiBtn.style.display = 'none';
            } else {
                aiContent.innerHTML = `
                    <div style="
                        text-align: center; 
                        padding: 20px; 
                        background: linear-gradient(135deg, rgba(231, 76, 60, 0.05), rgba(192, 57, 43, 0.05));
                        border-radius: 10px;
                        border: 1px solid rgba(231, 76, 60, 0.2);
                    ">
                        <div style="
                            font-size: 1.5rem; 
                            margin-bottom: 12px;
                            color: #e74c3c;
                        ">⚠️</div>
                        <div style="
                            color: #e74c3c;
                            font-weight: 500;
                            margin-bottom: 8px;
                            font-size: 0.95rem;
                        ">${currentLang === 'he' ? 'שגיאה בקבלת מידע מ-AI' : 'Error getting AI information'}</div>
                        <div style="
                            color: #c53030;
                            font-size: 0.85rem;
                            line-height: 1.4;
                        ">${aiResult.error}</div>
                    </div>
                `;
                
                // Reset button state on error
                aiBtn.innerHTML = `
                    <span>🤖</span>
                    <span>${currentLang === 'he' ? 'קרא עוד עם AI' : 'Learn more with AI'}</span>
                `;
                aiBtn.style.pointerEvents = 'auto';
            }
            
            isLoadingAI = false;
        });
    }

    // View country details button
    const viewCountryBtn = modalContent.querySelector('.view-country-details');
    if (viewCountryBtn && event.country) {
        viewCountryBtn.addEventListener('click', () => {
            closeModal();
            // Wait a moment for the modal to close, then open country modal
            setTimeout(() => {
                if (window.openCountryModal) {
                    const countryCode = event.country.name || event.country.name_en || countryName;
                    const countryNameHeb = event.country.name_he || countryName;
                    window.openCountryModal(countryCode, countryNameHeb);
                }
                // Reset modal state when opening country modal
                currentEventModal = null;
                isEventModalOpen = false;
            }, 350);
        });
    }
    
    // Add hover effects to buttons
    const closeBtn = modalContent.querySelector('.timeline-event-modal-close');
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = '#c0392b';
        closeBtn.style.transform = 'scale(1.1)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = '#e74c3c';
        closeBtn.style.transform = 'scale(1)';
    });
    
    // AI button hover effects
    if (aiBtn) {
        aiBtn.addEventListener('mouseenter', () => {
            if (!isLoadingAI) {
                aiBtn.style.background = 'linear-gradient(45deg, #5a67d8, #6b46c1)';
                aiBtn.style.transform = 'translateY(-2px)';
                aiBtn.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.4)';
            }
        });
        aiBtn.addEventListener('mouseleave', () => {
            if (!isLoadingAI) {
                aiBtn.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
                aiBtn.style.transform = 'translateY(0)';
                aiBtn.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.3)';
            }
        });
    }
    
    if (viewCountryBtn) {
        viewCountryBtn.addEventListener('mouseenter', () => {
            viewCountryBtn.style.background = '#4b2e2e';
            viewCountryBtn.style.transform = 'translateY(-2px)';
        });
        viewCountryBtn.addEventListener('mouseleave', () => {
            viewCountryBtn.style.background = '#8B4513';
            viewCountryBtn.style.transform = 'translateY(0)';
        });
    }
}

// Update formatDate function to support both languages
function formatDate(dateString, currentLang = 'he') {
    const date = new Date(dateString);
    
    if (currentLang === 'he') {
        const hebrewMonths = [
            'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
            'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
        ];
        return `${date.getDate()} ${hebrewMonths[date.getMonth()]} ${date.getFullYear()}`;
    } else {
        // English format
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
}