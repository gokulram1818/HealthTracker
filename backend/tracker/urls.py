from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, RegisterView, UserProfileView,
    CitizenListView, VaccinationViewSet, HealthRecordViewSet, 
    HealthCampViewSet, NotificationViewSet, AdminStatsView, UserViewSet,
    CampRegistrationViewSet
)

router = DefaultRouter()
router.register(r'vaccinations', VaccinationViewSet, basename='vaccination')
router.register(r'health-records', HealthRecordViewSet, basename='health-record')
router.register(r'health-camps', HealthCampViewSet, basename='health-camp')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'users', UserViewSet, basename='user')
router.register(r'camp-registrations', CampRegistrationViewSet, basename='camp-registration')



urlpatterns = [
    # Auth endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', UserProfileView.as_view(), name='user_profile'),
    
    # Citizens list (Health Workers / Admins)
    path('citizens/', CitizenListView.as_view(), name='citizen_list'),
    
    # Admin stats
    path('admin-dashboard/stats/', AdminStatsView.as_view(), name='admin_stats'),
    
    # Router endpoints
    path('', include(router.urls)),
]
