// js/soldierHandler.js

/**
 * Shows detailed information about a soldier in a modal
 * @param {Object} soldier - The soldier object containing soldier data
 */
export async function showSoldierDetails(soldier) {
    console.log("🔵 לוחם שנבחר:", soldier);
    
    // Get the soldier ID to fetch full details
    const soldierId = soldier.id;
    console.log("🔍 Fetching details for soldier ID:", soldierId);
    
    // Show modal and loading state
    const modal = document.getElementById("soldierModal");
    if (!modal) {
        console.error("❌ שגיאה: מודאל הלוחם לא נמצא!");
        return;
    }
    
    // מנע גלילה של העמוד מאחורי המודל
    document.body.style.overflow = 'hidden';
    
    showLoadingState();
    
    try {
        // Get current language from document or default to 'he'
        const currentLang = document.documentElement.lang || 'he';
        
        // Fetch soldier details from API
        let apiUrl = `/soldier/${soldierId}/?lang=${currentLang}`;
        console.log("🔍 API URL (attempt 1):", apiUrl);
        
        let response = await fetch(apiUrl);
        console.log("🔍 API Response status (attempt 1):", response.status);
        
        // If first attempt fails, try with language prefix
        if (!response.ok && response.status === 404) {
            apiUrl = `/he/soldier/${soldierId}/?lang=${currentLang}`;
            console.log("🔍 API URL (attempt 2 with /he/):", apiUrl);
            response = await fetch(apiUrl);
            console.log("🔍 API Response status (attempt 2):", response.status);
        }
        
        // If still fails, try without leading slash
        if (!response.ok && response.status === 404) {
            apiUrl = `soldier/${soldierId}/?lang=${currentLang}`;
            console.log("🔍 API URL (attempt 3 without leading /):", apiUrl);
            response = await fetch(apiUrl);
            console.log("🔍 API Response status (attempt 3):", response.status);
        }
        
        console.log("🔍 Final API Response headers:", response.headers);
        
        if (!response.ok) {
            console.error(`🔍 API Response not OK: ${response.status} ${response.statusText}`);
            throw new Error(`שגיאה בקבלת מידע על הלוחם: ${response.status}`);
        }
        
        const responseText = await response.text();
        console.log("🔍 Raw API Response:", responseText);
        
        let soldierDetails;
        try {
            soldierDetails = JSON.parse(responseText);
        } catch (parseError) {
            console.error("🔍 JSON Parse Error:", parseError);
            throw new Error("שגיאה בפענוח תגובת השרת");
        }
        
        console.log("🔍 Parsed API Response data:", soldierDetails);
        
        // Populate the modal with soldier details
        populateSoldierModal(soldierDetails);
        
        // Display the modal
        modal.style.display = "block";
        
        // Setup close button
        setupSoldierModalClose();
        
    } catch (error) {
        console.error("❌ שגיאה בטעינת פרטי הלוחם:", error);
        console.log("🔍 Error details:", error.message);
        console.log("🔍 Falling back to basic info");
        
        // If fetch fails, still show the modal with basic info
        populateSoldierModal(soldier, true);
        modal.style.display = "block";
        setupSoldierModalClose();
    }
}

/**
 * Shows loading state in the soldier modal
 */
function showLoadingState() {
    // Set basic elements to loading state
    document.getElementById("soldierName").textContent = "טוען...";
    document.getElementById("soldierImage").src = "";
    
    // Add loading spinners to content areas
    const sections = [
        "soldierDetails",
        "soldierFightingDesc",
        "soldierGettoDesc",
        "soldierWounds",
        "soldierDeathDetails"
    ];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.innerHTML = `
                <div class="loading-spinner-container">
                    <div class="loading-spinner"></div>
                    <p>טוען מידע...</p>
                </div>
            `;
        }
    });
}

/**
 * Populates the soldier modal with data
 * @param {Object} soldier - The soldier data object
 * @param {boolean} isBasicInfo - Whether we're using basic info or complete details
 */
function populateSoldierModal(soldier, isBasicInfo = false) {
    console.log("🔍 populateSoldierModal called with:", soldier);
    console.log("🔍 isBasicInfo:", isBasicInfo);
    
    // Basic info elements
    document.getElementById("soldierName").textContent = soldier.name || `לוחם ${soldier.id}`;
    
    // Set images
    const imageUrl = soldier.image_url || soldier.image || getDefaultImageByGender(soldier.gender);
    document.getElementById("soldierImage").src = imageUrl;
    
    // Set badge with gender or rank info
    const badge = document.getElementById("soldierBadge");
    if (badge) {
        const gender = getGenderText(soldier.gender);
        const rank = isBasicInfo ? "" : soldier.rank;
        badge.textContent = rank || gender || "לוחם/ת";
    }
    
    if (isBasicInfo) {
        console.log("🔍 Using basic info only");
        // We only have basic info, so display that with a message
        setBasicSoldierInfo(soldier);
        return;
    }
    
    console.log("🔍 Processing full soldier details");
    
    // Debug: log all available fields
    console.log("🔍 Available fields in soldier object:");
    Object.keys(soldier).forEach(key => {
        console.log(`🔍 ${key}:`, soldier[key]);
    });
    
    // Helper function to check if value has meaningful content
    const hasValue = (value) => {
        return value && 
               value !== null && 
               value !== undefined && 
               value !== '' && 
               value.toString().trim() !== '' &&
               value.toString().toLowerCase() !== 'nan';
    };
    
    // Helper function to set element and hide row if empty
    const setElementText = (elementId, value) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const parentRow = element.closest('.info-row');
        
        if (hasValue(value)) {
            element.textContent = value;
            if (parentRow) parentRow.style.display = '';
        } else {
            element.textContent = '';
            if (parentRow) parentRow.style.display = 'none';
        }
    };
    
    // Helper function to set text block and hide section if empty
    const setTextBlock = (elementId, value) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const parentSection = element.closest('.details-section');
        
        if (hasValue(value)) {
            element.textContent = value;
            if (parentSection) parentSection.style.display = '';
        } else {
            element.textContent = '';
            if (parentSection) parentSection.style.display = 'none';
        }
    };
    
    // Show all sections and rows first
    document.querySelectorAll('.details-section').forEach(section => {
        section.style.display = '';
    });
    document.querySelectorAll('.info-row').forEach(row => {
        row.style.display = '';
    });
    
    // Personal details - using helper functions
    console.log("🔍 Setting personal details:");
    console.log("🔍 father_name:", soldier.father_name);
    console.log("🔍 mother_name:", soldier.mother_name);
    
    setElementText("soldierBirthDate", formatDate(soldier.date_of_birth));
    setElementText("soldierBirthCity", soldier.birth_city);
    setElementText("soldierBirthCountry", soldier.birth_country?.name);
    setElementText("soldierAliyaDate", formatDate(soldier.aliya_date));
    setElementText("soldierFatherName", soldier.father_name);
    setElementText("soldierMotherName", soldier.mother_name);
    setElementText("soldierPreviousLastName", soldier.previous_last_name);
    setElementText("soldierNickname", soldier.nickname);
    
    // Military service
    setElementText("soldierArmy", soldier.army);
    setElementText("soldierRole", soldier.army_role);
    setElementText("soldierRank", soldier.rank);
    
    // Death information
    setElementText("soldierDeathDate", formatDate(soldier.date_of_death));
    setElementText("soldierDeathPlace", soldier.place_of_death);
    
    // Text blocks
    setTextBlock("soldierParticipation", soldier.participation);
    setTextBlock("soldierDecorations", soldier.decorations);
    setTextBlock("soldierBiography", soldier.biography);
    setTextBlock("soldierFightingDesc", soldier.fighting_description);
    setTextBlock("soldierGettoDesc", soldier.getto_description);
    setTextBlock("soldierWounds", soldier.wounds);
    setTextBlock("soldierDeathDetails", soldier.death_details);
    
    // Check if sections have any visible content and hide empty sections
    setTimeout(() => {
        document.querySelectorAll('.details-section').forEach(section => {
            const visibleRows = section.querySelectorAll('.info-row:not([style*="display: none"])');
            const visibleTextBlocks = section.querySelectorAll('.text-block:not([style*="display: none"])');
            
            // If section has no visible rows or text blocks, hide it
            if (visibleRows.length === 0 && visibleTextBlocks.length === 0) {
                section.style.display = 'none';
            }
        });
    }, 10);
    
    console.log("🔍 Finished setting all fields");
    
    // Note: Removed video and large image handling since we now use single column layout
}

/**
 * Sets basic soldier info when full details aren't available
 * @param {Object} soldier - Basic soldier data
 */
function setBasicSoldierInfo(soldier) {
    // Hide all detail fields by default
    const detailFields = document.querySelectorAll('.info-row');
    detailFields.forEach(field => {
        field.style.display = 'none';
    });
    
    // Hide all text blocks
    const textBlocks = [
        "soldierParticipation", "soldierDecorations", "soldierBiography",
        "soldierFightingDesc", "soldierGettoDesc", "soldierWounds", "soldierDeathDetails"
    ];
    
    textBlocks.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
            // Hide parent section
            const parentSection = element.closest('.details-section');
            if (parentSection) {
                parentSection.style.display = 'none';
            }
        }
    });
    
    // Set country if available
    if (soldier.country) {
        const countryElement = document.getElementById("soldierBirthCountry");
        const countryRow = countryElement?.closest('.info-row');
        if (countryElement && countryRow) {
            countryElement.textContent = soldier.country;
            countryRow.style.display = '';
        }
    }
    
    // Hide sections that don't have any visible content
    const detailsSections = document.querySelectorAll('.details-section');
    detailsSections.forEach(section => {
        let hasVisibleContent = false;
        
        // Check for visible info-rows
        const infoRows = section.querySelectorAll('.info-row');
        infoRows.forEach(row => {
            if (row.style.display !== 'none') {
                hasVisibleContent = true;
            }
        });
        
        // Check for visible text blocks
        const textBlocks = section.querySelectorAll('.text-block');
        textBlocks.forEach(block => {
            if (block.style.display !== 'none') {
                hasVisibleContent = true;
            }
        });
        
        // Hide section if it has no visible content
        section.style.display = hasVisibleContent ? '' : 'none';
    });
}

/**
 * Get gender text representation
 * @param {string|number} gender - Gender code
 * @returns {string} - Gender text in current language
*/
function getGenderText(gender) {
    // Get current language from document
    const currentLang = document.documentElement.lang || 'he';
    
    if (gender === "1" || gender === "1.0" || gender === 1) {
        return currentLang === 'he' ? "זכר" : "Male";
    } 
    else if (gender === "0" || gender === "0.0" || gender === 0) {
        return currentLang === 'he' ? "נקבה" : "Female";
    }
    return currentLang === 'he' ? "--" : "--";
}

/**
 * Get default profile image based on gender
 * @param {string|number} gender - Gender code
 * @returns {string} - URL to default image
 */
function getDefaultImageByGender(gender) {
    if (gender === "1" || gender === "1.0" || gender === 1) {
        return "https://media.istockphoto.com/id/666545204/vector/default-placeholder-profile-icon.jpg?s=612x612&w=0&k=20&c=UGYk-MX0pFWUZOr5hloXDREB6vfCqsyS7SgbQ1-heY8=";
    }
    return "https://media.istockphoto.com/id/666545148/vector/default-placeholder-profile-icon.jpg?s=612x612&w=0&k=20&c=swBnLcHy6L9v5eaiRkDwfGLr5cfLkH9hKW-sZfH-m90=";
}

/**
 * Format date strings for display
 * @param {string} dateStr - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDate(dateStr) {
    if (!dateStr) return "--";
    
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('he-IL');
    } catch (e) {
        return dateStr;
    }
}

/**
 * Sets up the close button for the soldier modal
 */
function setupSoldierModalClose() {
    const modal = document.getElementById("soldierModal");
    const closeButton = document.getElementById("soldierClose");
    
    if (closeButton) {
        // Remove existing event listeners (to prevent duplicates)
        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
        
        // Add new event listener
        newCloseButton.addEventListener("click", closeSoldierModal);
    }
    
    // Close when clicking outside the modal
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeSoldierModal();
        }
    });
}

/**
 * Closes the soldier modal
 */
export function closeSoldierModal() {
    const modal = document.getElementById("soldierModal");
    if (modal) {
        modal.style.display = "none";
        
        // החזר גלילה לעמוד הראשי
        document.body.style.overflow = '';
    }
}

// Make closeSoldierModal available globally for the inline onclick handler
window.closeSoldierModal = closeSoldierModal;
