// Initialize the Map
const map = new maplibregl.Map({
    container: 'map', // ID of the map container in HTML
    style: 'https://api.maptiler.com/maps/66aaf810-42b4-405e-b738-f7b427aa3adc/style.json?key=id6E01naKP3UCWgW7hY1',
    center: [40.80402, -2.61425], // Initial center of the map
    zoom: 1, // Initial zoom level
    interactive: false // Disable interactions for moving background map
});

// Add smooth panning animation for the moving map
setInterval(() => {
    map.panBy([3, 0], { duration: 0 }); // Pan map horizontally
}, 100);

// Handle Timeline button click
const timelineButton = document.getElementById("show-timeline");

timelineButton.addEventListener("click", (e) => {
    e.preventDefault();
    // כאן נוסיף את הלוגיקה להצגת ציר הזמן האינטראקטיבי
    showInteractiveTimeline();
});

function showInteractiveTimeline() {
    // Get current language
    const currentLang = document.documentElement.lang || 'he';
    
    // יצירת חלון טעינה
    const loadingModal = document.createElement('div');
    loadingModal.className = 'timeline-modal';
    const loadingTitle = currentLang === 'he' ? 'טוען אירועים...' : 'Loading events...';
    loadingModal.innerHTML = `
        <div class="timeline-content">
            <div class="timeline-header">
                <h2>${loadingTitle}</h2>
                <div class="loading-spinner"></div>
            </div>
        </div>
    `;
    document.body.appendChild(loadingModal);
    
    setTimeout(() => {
        loadingModal.classList.add('timeline-modal-active');
    }, 10);

    // Add language parameter to the API call
    const apiUrl = currentLang === 'he' ? '/events/?lang=he' : '/events/?lang=en';

    // קריאה לשרת לקבלת האירועים
    fetch(apiUrl)
        .then(response => response.json())
        .then(events => {
            // הסרת חלון הטעינה
            loadingModal.remove();

            const processedEvents = events.map((event, index) => {
                const date = new Date(event.date);
                const year = date.getFullYear();
                const month = date.toLocaleDateString(currentLang === 'he' ? 'he-IL' : 'en-US', { month: 'long' });

                // אייקונים לפי סוג האירוע
                let icon = '⚔️';
                let color = '#8B4513';
                
                if (event.title && currentLang === 'he') {
                    if (event.title.includes('פלישה') || event.title.includes('פולש')) {
                        icon = '🚀'; color = '#e74c3c';
                    } else if (event.title.includes('כניעה') || event.title.includes('נכנע')) {
                        icon = '🏳️'; color = '#95a5a6';
                    } else if (event.title.includes('פצצה') || event.title.includes('הפצצה')) {
                        icon = '💥'; color = '#f39c12';
                    } else if (event.title.includes('שחרור') || event.title.includes('משחרר')) {
                        icon = '🎉'; color = '#27ae60';
                    } else if (event.title.includes('קרב') || event.title.includes('לחימה')) {
                        icon = '⚔️'; color = '#8B4513';
                    }
                } else if (event.title && currentLang === 'en') {
                    if (event.title.toLowerCase().includes('invasion') || event.title.toLowerCase().includes('invade')) {
                        icon = '🚀'; color = '#e74c3c';
                    } else if (event.title.toLowerCase().includes('surrender') || event.title.toLowerCase().includes('capitulation')) {
                        icon = '🏳️'; color = '#95a5a6';
                    } else if (event.title.toLowerCase().includes('bomb') || event.title.toLowerCase().includes('bombing')) {
                        icon = '💥'; color = '#f39c12';
                    } else if (event.title.toLowerCase().includes('liberation') || event.title.toLowerCase().includes('liberate')) {
                        icon = '🎉'; color = '#27ae60';
                    } else if (event.title.toLowerCase().includes('battle') || event.title.toLowerCase().includes('fight')) {
                        icon = '⚔️'; color = '#8B4513';
                    }
                }
                
                return {
                    ...event,
                    year: year,
                    month: month,
                    icon: icon,
                    color: color,
                    details: event.description || (currentLang === 'he' ? 'לא מוגדר תיאור מפורט לאירוע זה.' : 'No detailed description available for this event.')
                };
            }).sort((a, b) => new Date(a.date) - new Date(b.date)); // מיון לפי תאריך

            // יצירת רשימת שנים ייחודיות
            const years = [...new Set(processedEvents.map(event => event.year))].sort();

            const modal = document.createElement('div');
            modal.className = 'timeline-modal';
            
            const mainTitle = currentLang === 'he' ? 'ציר הזמן של מלחמת העולם השנייה' : 'World War II Timeline';
            const subtitle = currentLang === 'he' ? 
                `האירועים המכריעים שעיצבו את ההיסטוריה • ${processedEvents.length} אירועים` :
                `The decisive events that shaped history • ${processedEvents.length} events`;
            const allYearsText = currentLang === 'he' ? 'כל השנים' : 'All Years';
            
            modal.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h2>${mainTitle}</h2>
                        <p class="timeline-subtitle">${subtitle}</p>
                    </div>
                    <div class="timeline-navigation">
                        <button class="timeline-nav-btn active" data-year="all">${allYearsText}</button>
                        ${years.map(year => `
                            <button class="timeline-nav-btn" data-year="${year}">${year}</button>
                        `).join('')}
                    </div>
                    <div class="timeline-container">
                        ${processedEvents.map((event, index) => `
                            <div class="timeline-item enhanced" data-year="${event.year}" data-index="${index}">
                                <div class="timeline-content-item">
                                    <div class="timeline-date">
                                        <span class="year">${event.year}</span>
                                        <span class="month">${event.month}</span>
                                    </div>
                                    <h3>${event.title}</h3>
                                    ${event.country && event.country.name_he ? `<p class="timeline-location">${currentLang === 'he' ? event.country.name_he : event.country.name_en || event.country.name_he}</p>` : ''}
                                    <button class="timeline-details-btn" data-index="${index}">${currentLang === 'he' ? 'קרא עוד' : 'Read More'}</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="timeline-progress">
                        <div class="progress-line"></div>
                        <span class="progress-text">${currentLang === 'he' ? 'גלול למטה לראות עוד אירועים' : 'Scroll down to see more events'}</span>
                    </div>
                    <button class="close-timeline">✕</button>
                </div>
            `;
            
            document.body.appendChild(modal);

            // הוספת אנימציית כניסה
            setTimeout(() => {
                modal.classList.add('timeline-modal-active');
            }, 10);

            // הוספת מאזין לכפתור הסגירה
            const closeButton = modal.querySelector('.close-timeline');
            closeButton.addEventListener('click', () => {
                modal.classList.remove('timeline-modal-active');
                setTimeout(() => modal.remove(), 300);
            });

            // הוספת מאזינים לכפתורי "קרא עוד"
            const detailButtons = modal.querySelectorAll('.timeline-details-btn');
            detailButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    showEventDetails(processedEvents[index], currentLang);
                });
            });

            // הוספת מאזינים לכפתורי השנים
            const navButtons = modal.querySelectorAll('.timeline-nav-btn');
            navButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const selectedYear = e.target.dataset.year;
                    filterTimelineByYear(selectedYear);
                    // עדכון כפתור פעיל
                    navButtons.forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');
                });
            });

            // אנימציית האירועים
            const timelineItems = modal.querySelectorAll('.timeline-item');
            timelineItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('timeline-item-visible');
                }, index * 100);
            });
        })
        .catch(error => {
            // טיפול בשגיאות
            const errorTitle = currentLang === 'he' ? 'שגיאה בטעינת האירועים' : 'Error Loading Events';
            const errorMessage = currentLang === 'he' ? 'אנא נסה שוב מאוחר יותר' : 'Please try again later';
            const closeText = currentLang === 'he' ? 'סגור' : 'Close';
            
            loadingModal.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h2>${errorTitle}</h2>
                        <p>${errorMessage}</p>
                        <button class="close-timeline" onclick="this.closest('.timeline-modal').remove()">${closeText}</button>
                    </div>
                </div>
            `;
            console.error('Error loading events:', error);
        });
}

function filterTimelineByYear(selectedYear) {
    const timelineItems = document.querySelectorAll('.timeline-item.enhanced');
    
    timelineItems.forEach(item => {
        const itemYear = item.dataset.year;
        
        if (selectedYear === 'all' || itemYear === selectedYear) {
            // הצגת האירוע
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 50);
        } else {
            // הסתרת האירוע
            item.style.opacity = '0';
            item.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}

function showEventDetails(event, currentLang = 'he') {
    const modal = document.createElement('div');
    modal.className = 'event-detail-modal';
    
    const detailsTitle = currentLang === 'he' ? 'פרטי האירוע' : 'Event Details';
    const dateLabel = currentLang === 'he' ? 'תאריך:' : 'Date:';
    const locationLabel = currentLang === 'he' ? 'מיקום:' : 'Location:';
    const descriptionLabel = currentLang === 'he' ? 'תיאור מפורט' : 'Detailed Description';
    const closeText = currentLang === 'he' ? 'סגור' : 'Close';
    
    // Format date based on language
    const formattedDate = new Date(event.date).toLocaleDateString(
        currentLang === 'he' ? 'he-IL' : 'en-US', 
        { year: 'numeric', month: 'long', day: 'numeric' }
    );
    
    modal.innerHTML = `
        <div class="event-detail-content">
            <div class="event-header" style="background: linear-gradient(135deg, ${event.color}dd, ${event.color}aa);">
                <div class="event-icon" style="background-color: ${event.color};">${event.icon}</div>
                <div class="event-title-section">
                    <h2>${event.title}</h2>
                    <div class="event-date">${dateLabel} ${formattedDate}</div>
                    ${event.country ? `<div class="event-location">${locationLabel} ${currentLang === 'he' ? (event.country.name_he || event.country.name_en) : (event.country.name_en || event.country.name_he)}</div>` : ''}
                </div>
                <button class="close-event-detail">${closeText}</button>
            </div>
            <div class="event-body">
                <div class="event-description-section">
                    <h4>${descriptionLabel}</h4>
                    <div class="event-main-description">
                        ${event.details}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('event-detail-active');
    }, 10);
    
    // Add event listener for close button
    const closeButton = modal.querySelector('.close-event-detail');
    closeButton.addEventListener('click', () => {
        modal.classList.remove('event-detail-active');
        setTimeout(() => modal.remove(), 300);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('event-detail-active');
            setTimeout(() => modal.remove(), 300);
        }
    });
}

function showEventsForYear(year) {
    // שיפור הפונקציה הקיימת
    console.log(`Showing detailed events for year ${year}`);
    // TODO: הוספת לוגיקה להצגת אירועים מפורטים לפי שנה
}

document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    if (darkModeToggle) {
        // Check for saved dark mode preference
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️'; // Set to sun if dark mode is enabled
        } else {
            darkModeToggle.textContent = '🌙'; // Set to moon if dark mode is disabled
        }

        darkModeToggle.addEventListener('click', function() {
            if (document.body.classList.contains('dark-mode')) {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled');
                darkModeToggle.textContent = '🌙'; // Change to moon
            } else {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled');
                darkModeToggle.textContent = '☀️'; // Change to sun
            }
        });
    }
});