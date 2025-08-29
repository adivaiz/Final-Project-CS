// Import the showEventModal function from timeline.js
import { showEventModal } from './timeline.js';
import { GEMINI_CONFIG } from './ai-config.js';

// Global variable to track current event
let currentEventId = null;
let eventsWithAIOutput = new Set(); // Track events that have shown AI output

// New function to show event details in a dedicated modal (similar to soldier modal)
export async function showEventDetails(event) {
    console.log("🔵 אירוע שנבחר:", event);
    
    // Get current language
    const currentLang = document.documentElement.lang || 'he';
    
    // Create a new modal element for the event (separate from country modal)
    let eventModal = document.getElementById("eventDetailsModal");
    if (!eventModal) {
        eventModal = document.createElement("div");
        eventModal.id = "eventDetailsModal";
        eventModal.className = "modal";
        eventModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 4000;
            display: none;
        `;
        document.body.appendChild(eventModal);
    }
    
    // Create event modal content
    createEventModalContent(event, currentLang, eventModal);
    
    // Display the modal
    eventModal.style.display = "block";
    
    // Setup close button
    setupEventModalClose(eventModal);
}

// Function to create event modal content
function createEventModalContent(event, currentLang, modal) {
    if (!modal) return;
    
    // Format date for display
    const eventDate = formatDate(event.date, currentLang);
    const countryName = event.country ? (event.country.name || event.country.name_he || 'Unknown') : 'Unknown';
    
    // Check if this event has already shown AI output
    const eventKey = `${event.id || event.title}-${event.date}`;
    const hasShownAI = eventsWithAIOutput.has(eventKey);
    
    modal.innerHTML = `
        <div id="eventContent" class="content">
            <!-- Close button -->
            <div class="modal-controls">
                <button id="eventDetailsClose" class="eventClose">
                    <span class="closeText">${currentLang === 'he' ? 'סגור' : 'Close'}</span>
                    <span class="closeX">×</span>
                </button>
            </div>

            <div class="event-modal-layout">
                <!-- Event Header Section -->
                <div class="event-modal-header">
                    <div class="event-title-section">
                        <h1 class="event-main-title">${event.title}</h1>
                        <div class="event-meta-info">
                            <div class="event-date-badge">
                                <span class="date-text">${eventDate}</span>
                            </div>
                            <div class="event-location-badge">
                                <span class="location-text">${countryName}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Event Content Section -->
                <div class="event-content-section">
                    ${event.description ? `
                        <div class="event-description-card">
                            <h3 class="section-title">
                                ${currentLang === 'he' ? 'תיאור האירוע' : 'Event Description'}
                            </h3>
                            <div class="description-content">${event.description}</div>
                        </div>
                    ` : ''}
                    
                    ${event.casualties ? `
                        <div class="event-casualties-card">
                            <h3 class="section-title casualties-title">
                                <span class="title-icon">⚠️</span>
                                ${currentLang === 'he' ? 'נפגעים' : 'Casualties'}
                            </h3>
                            <div class="casualties-content">${event.casualties}</div>
                        </div>
                    ` : ''}
                    
                    <!-- AI Section -->
                    <div class="event-ai-card">
                        <h3 class="section-title ai-title">
                            <span class="title-icon">🤖</span>
                            ${currentLang === 'he' ? 'מידע נוסף עם AI' : 'Additional AI Information'}
                        </h3>
                        ${!hasShownAI ? `
                            <button class="ai-learn-more-btn">
                                <span class="ai-icon" style="font-size: 0.8rem;">🤖</span>
                                <span class="ai-text">${currentLang === 'he' ? 'קרא עוד עם AI' : 'Learn more with AI'}</span>
                            </button>
                        ` : ''}
                        
                        <div class="ai-response-content" style="display: ${hasShownAI ? 'block' : 'none'};">
                            <!-- AI response will be inserted here -->
                        </div>
                    </div>
                </div>

                <!-- Event Images Section (Large at bottom) -->
                ${event.image ? `
                    <div class="event-images-section">
                        <h3 class="section-title images-title">
                        </h3>
                        <div class="event-large-image-container">
                            <img src="${event.image}" alt="${event.title}" class="event-large-image">
                            <div class="image-caption">
                                ${event.title} - ${eventDate}
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Setup AI button functionality
    setupAIButton(event, currentLang, eventKey, hasShownAI, modal);
}

// Function to setup AI button functionality
function setupAIButton(event, currentLang, eventKey, hasShownAI, modal) {
    const aiBtn = modal.querySelector('.ai-learn-more-btn');
    const aiContent = modal.querySelector('.ai-response-content');
    
    if (!aiBtn || hasShownAI) return;
    
    let isLoadingAI = false;
    
    aiBtn.addEventListener('click', async () => {
        if (isLoadingAI) return;
        
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
        
        // Add spinning animation
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
        
        // Show AI section and add loading message
        aiContent.style.display = 'block';
        aiContent.innerHTML = `
            <div style="
                text-align: center; 
                padding: 20px 15px; 
                color: #667eea;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
                border-radius: 8px;
            ">
                <div style="
                    font-size: 1.2rem; 
                    margin-bottom: 10px;
                    animation: pulse 2s infinite;
                ">🤖</div>
                <div style="
                    font-size: 0.85rem;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: #4a5568;
                ">${currentLang === 'he' ? 'AI חושב ומחפש מידע נוסף...' : 'AI is thinking and searching for additional information...'}</div>
                <div style="
                    font-size: 0.75rem;
                    color: #718096;
                    font-style: italic;
                ">${currentLang === 'he' ? 'זה ייקח כמה שניות' : 'This will take a few seconds'}</div>
            </div>
        `;
        
        // Get AI information
        const aiResult = await getAIInformation(event, currentLang);
        
        // Update content based on result
        if (aiResult.success) {
            // Format the AI response with better styling - matching timeline style
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
            
            // Mark this event as having shown AI output and hide button
            eventsWithAIOutput.add(eventKey);
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
                <span class="ai-icon">🤖</span>
                <span class="ai-text">${currentLang === 'he' ? 'קרא עוד עם AI' : 'Learn more with AI'}</span>
                <span class="ai-arrow">→</span>
            `;
            aiBtn.style.pointerEvents = 'auto';
        }
        
        isLoadingAI = false;
    });
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
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
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

// Function to setup event modal close functionality
function setupEventModalClose(modal) {
    const closeButton = modal.querySelector("#eventDetailsClose");
    
    if (closeButton) {
        closeButton.addEventListener("click", () => closeEventModal(modal));
    }
    
    // Close when clicking outside the modal content
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeEventModal(modal);
        }
    });
    
    // Close with Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeEventModal(modal);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Function to close event modal
export function closeEventModal(modal = null) {
    const eventModal = modal || document.getElementById("eventDetailsModal");
    if (eventModal) {
        eventModal.style.display = "none";
        // Don't restore body overflow since country modal is still open
    }
}

// Make closeEventModal available globally
window.closeEventModal = closeEventModal;

// Add pulse animation styles if not exists
if (!document.querySelector('#ai-pulse-animation')) {
    const style = document.createElement('style');
    style.id = 'ai-pulse-animation';
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

//מייצא פונקציה שמעדכנת את המודאל עם פרטי האירוע שנבחר
export function displayEvent(event) {
    console.log("Displaying event details:", event);
    
    // Make sure we have a valid event object
    if (!event) {
        console.error("No valid event data to display");
        return;
    }
    
    // Get all the elements
    const eventTitle = document.getElementById("eventTitle");
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");
    const location = document.getElementById("location");
    const eventSummary = document.getElementById("eventSummary");
    const eventDetails = document.getElementById("eventDetails");

    // Make sure event details section is visible
    if (eventDetails) {
        eventDetails.style.display = "block";
    }

    // Get event data with fallbacks for different field names
    const title = event.name || event.title || 'אירוע ללא שם';
    const start = event.date || event.start_date || "לא ידוע";
    const end = event.endDate || event.end_date || event.date || "לא ידוע";
    const locationText = event.location || event.country__name_he || event.country__name || "לא ידוע";
    
    // Convert the event description to html if showdown is available
    let description = event.description || event.summary || "אין תיאור זמין";
    if (window.showdown) {
        try {
    const converter = new showdown.Converter();
            description = converter.makeHtml(description);
        } catch (error) {
            console.error("Error converting markdown:", error);
        }
    }

    // Update fields with the event data
    if (eventTitle && window.currentCountryName) {
        eventTitle.textContent = window.currentCountryName;  // Always show country name
    }
    
    if (startDate) startDate.textContent = start;
    if (endDate) endDate.textContent = end;
    if (location) location.textContent = locationText;
    if (eventSummary) eventSummary.innerHTML = description;



    // Save the current event ID for reference
    currentEventId = event.id;
    
    // Highlight the active event card
    highlightActiveEvent(event.id);
    

}

export function showCountryEvents(countryName, events) {
    console.log("Showing events for country:", countryName);
    console.log("Events:", events);
    
    // Get current language
    const currentLang = document.documentElement.lang || 'he';
    
    window.currentCountryName = countryName;
    const eventTitle = document.getElementById('eventTitle');
    const eventsContainer = document.getElementById('eventsContainer');
    const eventDetails = document.getElementById('eventDetails');
    
    // Set country name in title
    if (eventTitle) {
        eventTitle.textContent = countryName;
    }
    
    // Hide the event details section since we'll use separate modals
    if (eventDetails) {
        eventDetails.style.display = 'none';
    }
    
    // Clear previous events and show loading state
    if (eventsContainer) {
        const currentLang = document.documentElement.lang || 'he';
        const loadingText = currentLang === 'he' ? 'טוען אירועים...' : 'Loading events...';
        eventsContainer.innerHTML = `<div class="loading-events">${loadingText}</div>`;
        
        // Use setTimeout to ensure DOM is updated before adding events
        setTimeout(() => {
            if (events && events.length > 0) {
                console.log("Creating event cards...");
                eventsContainer.innerHTML = ''; // Clear loading message
                
                // Create event cards
                events.forEach(event => {
                    console.log("Creating card for event:", event);
                    const eventCard = document.createElement('div');
                    eventCard.className = 'event-card';
                    
                    // Get event data with fallbacks for different field names
                    const eventTitle = event.name || event.title || 'אירוע ללא שם';
                    const eventDate = event.date || formatDate(event.start_date) || 'לא ידוע';
                    
                    // Create card content with clear structure
                    eventCard.innerHTML = `
                        <div class="card-content">
                            <div class="event-card-title">${eventTitle}</div>
                            <div class="event-card-date">${eventDate}</div>
                        </div>
                    `;
                    
                    // Add click event to open new dedicated event modal
                    eventCard.addEventListener('click', () => {
                        console.log("Event card clicked:", eventTitle);
                        
                        // Open dedicated event modal (similar to soldier modal)
                        showEventDetails(event);
                    });
                    
                    // Append card to container
                    eventsContainer.appendChild(eventCard);
                });
                
                // Add a message prompting user to select an event
                const promptDiv = document.createElement('div');
                promptDiv.className = 'select-event-prompt';
                promptDiv.innerHTML = `
                    <div style="
                        text-align: center; 
                        padding: 20px; 
                        color: #8B4513; 
                        font-style: italic;
                        background: rgba(245, 230, 211, 0.3);
                        border-radius: 8px;
                        margin-top: 10px;
                    ">
                        ${currentLang === 'he' ? 'לחץ על אירוע לפרטים נוספים' : 'Click on an event for more details'}
                    </div>
                `;
                eventsContainer.appendChild(promptDiv);
                
            } else {
                console.log("No events available");
                const currentLang = document.documentElement.lang || 'he';
                const noEventsText = currentLang === 'he' ? 'לא נמצאו אירועים למדינה זו' : 'No events found for this country';
                eventsContainer.innerHTML = `<div class="no-events">${noEventsText}</div>`;
            }
        }, 0);
    }
}

// Helper function to format date
function formatDate(dateString, currentLang = 'he') {
    if (!dateString) return currentLang === 'he' ? 'לא ידוע' : 'Unknown';
    try {
        const date = new Date(dateString);
        const locale = currentLang === 'he' ? 'he-IL' : 'en-US';
        return date.toLocaleDateString(locale);
    } catch (error) {
        console.error("Error formatting date:", error);
        return currentLang === 'he' ? 'לא ידוע' : 'Unknown';
    }
}

// Helper function to highlight active event (placeholder)
function highlightActiveEvent(eventId) {
    // This function was referenced but not needed for the new modal approach
    // Keeping as placeholder for backward compatibility
}

// Helper function to update multimedia (placeholder)
function updateMultimedia(event) {
    // This function was referenced but not needed for the new modal approach
    // Keeping as placeholder for backward compatibility
}
