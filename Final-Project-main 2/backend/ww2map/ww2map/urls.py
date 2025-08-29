from django.contrib import admin
from django.urls import path, include
from django.conf.urls.i18n import i18n_patterns  # תמיכה בריבוי שפות
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = i18n_patterns(
    path('admin/', admin.site.urls),
    path('', include('mapapp.urls')),  # דף הבית וה-API
)

# הוספת נתיב להחלפת שפה
urlpatterns += [
    path('i18n/', include('django.conf.urls.i18n')),  # תמיכה בהחלפת שפה
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
