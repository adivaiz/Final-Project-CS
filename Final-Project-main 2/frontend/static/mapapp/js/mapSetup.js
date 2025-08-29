export function createMap(MAPTILER_KEY) {
    const mapElement = document.getElementById("map");

    if (!mapElement) {
        console.error("❌ שגיאה: האלמנט עם id='map' לא נמצא ב־DOM!");
        return null;
    }

    console.log("🟡 אלמנט map:", mapElement);
    console.log("📏 גובה map:", mapElement.offsetHeight);
    console.log("📏 רוחב map:", mapElement.offsetWidth);

    try {
        const map = new maplibregl.Map({
            container: 'map', // ID of the map container in HTML
            style: 'https://api.maptiler.com/maps/66aaf810-42b4-405e-b738-f7b427aa3adc/style.json?key=id6E01naKP3UCWgW7hY1',
            center: [31.0461, 34.8516], // Initial center of the map
            zoom: 3, // Initial zoom level
            interactive: true,
            maxBounds: [
                [-170, -60],  // גבול דרום-מערבי: מערב מאוד ודרום מאוד
                [170, 85]     // גבול צפון-מזרחי: מזרח מאוד וצפון מאוד
            ]
        });

        // חובה: לטפל בטעינה
        map.on('load', () => {
            console.log("✅ המפה נטענה בהצלחה!");
        });

        map.on('error', (e) => {
            console.error("❌ שגיאה ממנוע המפה:", e.error);
        });

        return map;

    } catch (e) {
        console.error("❌ שגיאה בהגדרת המפה:", e);
        return null;
    }
}
