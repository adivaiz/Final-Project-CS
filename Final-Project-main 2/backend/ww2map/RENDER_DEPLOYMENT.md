# מדריך פריסה ל-Render

## הכנה מקדימה

1. וודא שהקבצים הבאים קיימים בתיקיה `backend/ww2map/`:
   - `requirements.txt` ✅
   - `build.sh` ✅
   - `manage.py` ✅
   - `load_data.py` ✅ (חדש!)

## שלב 1: העלאה ל-GitHub

```bash
# מהתיקיה הראשית של הפרויקט
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## שלב 2: יצירת חשבון ב-Render

1. היכנס ל-[render.com](https://render.com)
2. הירשם עם GitHub
3. חבר את החשבון שלך ל-GitHub

## שלב 3: יצירת PostgreSQL Database

1. ב-Render Dashboard, לחץ על "New"
2. בחר "PostgreSQL"
3. מלא את הפרטים:
   - **Name:** `ww2map-db`
   - **Database:** `ww2map`
   - **User:** `ww2user`
   - **Region:** בחר קרוב אליך
   - **Plan:** Free (0$)
4. לחץ "Create Database"

## שלב 4: יצירת Web Service

1. ב-Render Dashboard, לחץ על "New"
2. בחר "Web Service"
3. חבר את הרפוזיטורי שלך
4. מלא את הפרטים:

### Basic Settings:
- **Name:** `ww2map-app`
- **Region:** אותו אזור כמו ה-database
- **Branch:** `main`
- **Root Directory:** `backend/ww2map`
- **Runtime:** `Python 3`

### Build & Deploy:
- **Build Command:** `./build.sh`
- **Start Command:** `gunicorn ww2map.wsgi:application --bind 0.0.0.0:$PORT`

## שלב 5: הגדרת Environment Variables

ב-Web Service שיצרת, לך ל-"Environment" ומוסף:

### משתנים נדרשים:
```
SECRET_KEY=your-very-secure-secret-key-here-make-it-long-and-random
DEBUG=False
ALLOWED_HOSTS=your-app-name.onrender.com
DATABASE_URL=postgresql://user:password@host:port/database
```

### לקבלת DATABASE_URL:
1. לך ל-PostgreSQL Database שיצרת
2. ב-"Connections", העתק את "External Database URL"
3. השתמש בו בתור `DATABASE_URL`

## שלב 6: פריסה

1. לחץ "Create Web Service"
2. Render יתחיל לבנות ולפרוס את האפליקציה
3. תוכל לעקוב אחרי הלוגים ב-"Logs"

## שלב 7: טעינת הנתונים שלך 🗂️

אחרי שהפריסה הראשונה הושלמה בהצלחה:

1. ב-Render Dashboard, לך ל-Web Service שלך
2. לחץ על "Shell" (פתיחת terminal)
3. הריץ את הפקודה הבאה:

```bash
python load_data.py
```

זה יטען את כל הנתונים שלך:
- `backup_data.json` (69MB - הנתונים הראשיים)
- `my_events_updated.json` (617KB - עדכוני אירועים)

⚠️ **חשוב:** הטעינה עלולה לקחת מספר דקות בגלל גודל הקבצים.

## שלב 8: בדיקה

האתר שלך יהיה זמין בכתובת:
`https://your-app-name.onrender.com`

## טיפים חשובים:

### 🔒 Security
- השתמש ב-SECRET_KEY חזק ואקראי
- השאר DEBUG=False ב-production
- הוסף את הדומיין שלך ל-ALLOWED_HOSTS

### 📊 Monitoring
- עקוב אחרי לוגים ב-Render Dashboard
- Render Free Plan יכנס לsleep אחרי 15 דקות של חוסר פעילות

### 💾 הנתונים שלך
- הנתונים נשמרים ב-PostgreSQL Database
- יש לך backup_data.json (69MB) ו-my_events_updated.json (617KB)
- אם משהו ישתבש, תמיד תוכל לטעון מחדש עם `python load_data.py`

### 💰 חינמיות
- Database: 1GB חינמי (יספיק לנתונים שלך)
- Web Service: 750 שעות חינמיות לחודש
- Bandwidth: 100GB חינמי

## פתרון בעיות נפוצות:

### ❌ Build Failed
- בדוק שה-`build.sh` executable: `chmod +x build.sh`
- וודא שכל התלויות ב-`requirements.txt`

### ❌ Database Connection Error
- וודא שה-`DATABASE_URL` נכון
- בדוק שה-PostgreSQL Database פועל

### ❌ Static Files לא נטענים
- וודא שהריצת `collectstatic` ב-build script
- בדוק שWhiteNoise מוגדר נכון

### ❌ Data Loading Failed
- וודא שקבצי ה-JSON קיימים בתיקיה
- בדוק את הלוגים ב-Shell של Render
- נסה לטעון קובץ אחד בכל פעם

### ❌ Application Error
- בדוק את הלוגים ב-Render Dashboard
- וודא שכל משתני הסביבה מוגדרים

## עדכונים עתידיים:

כדי לעדכן את האתר:
1. דחוף שינויים ל-GitHub
2. Render יזהה ויפרוס אוטומטיות
3. או לחץ "Manual Deploy" ב-Render Dashboard

---

**✅ אחרי ביצוע כל השלבים והטעינת הנתונים, האתר שלך יהיה חי ב-internet עם כל המידע!** 