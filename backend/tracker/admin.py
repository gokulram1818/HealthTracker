from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Vaccination, HealthRecord, HealthCamp, Notification, CampRegistration

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'role', 'is_staff', 'created_by')
    list_filter = ('role', 'is_staff', 'is_superuser')
    search_fields = ('name', 'email')
    ordering = ('id',)

@admin.register(HealthCamp)
class HealthCampAdmin(admin.ModelAdmin):
    list_display = ('id', 'location', 'date', 'vaccine_type')
    search_fields = ('location', 'vaccine_type')
    list_filter = ('date',)

@admin.register(Vaccination)
class VaccinationAdmin(admin.ModelAdmin):
    list_display = ('id', 'vaccine_name', 'user', 'status', 'due_date', 'administered_by')
    list_filter = ('status', 'due_date')
    search_fields = ('vaccine_name', 'user__email', 'user__name')

@admin.register(HealthRecord)
class HealthRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'blood_group', 'dob', 'gender')
    search_fields = ('user__email', 'user__name', 'blood_group')

@admin.register(CampRegistration)
class CampRegistrationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'camp', 'registered_at')
    search_fields = ('user__email', 'camp__location', 'camp__vaccine_type')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')

