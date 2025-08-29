import { showCountryEventsModal } from "./modalHandler.js";
import { countryCodeMapping } from "./countryCodeMapping.js"; // אם אתה עדיין משתמש בזה


//מטפל בלחיצות על מדינות במפה
//מקבל את שם המדינה וקוד המדינה
//מעדכן את המודאל עם המידע הרלוונטי
export function handleCountryClick(country) {
    //מטפל בלחיצות על מדינות במפה
    const name = country.properties?.name;
    //אם אין שם מדינה או שהוא לא מחרוזת, מדגים שגיאה
    if (!name || typeof name !== "string") {
        console.warn("⚠️ לא נמצא שם מדינה תקף בפיצ'ר:", country.properties);
        return;
    }

    const countryName = name.trim().toLowerCase();
    console.log("🔍 מדינה שנבחרה מהמפה:", countryName);

    // קורא לפונקציית openCountryModal מקובץ index.js
    if (typeof window.openCountryModal === 'function') {
        // המר את שם המדינה באנגלית לעברית אם קיים במיפוי
        const hebrewName = findHebrewCountryName(countryName) || name;
        window.openCountryModal(countryName, hebrewName);
    } else {
        console.error("❌ פונקציית openCountryModal אינה זמינה");
    }
}

// פונקציה למציאת שם המדינה בעברית מתוך מיפוי countries באינדקס
function findHebrewCountryName(englishName) {
    // בדיקה שהמיפוי קיים
    if (!window.countries) {
        return null;
    }
    
    // חיפוש שם המדינה בעברית לפי שם באנגלית
    for (const [hebrewName, englishValue] of Object.entries(window.countries)) {
        if (englishValue.toLowerCase() === englishName.toLowerCase()) {
            return hebrewName;
        }
    }
    
    return null;
}
