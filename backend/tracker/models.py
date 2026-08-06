from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        # Ensure username defaults to email
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('citizen', 'Citizen'),
        ('health_worker', 'Health Worker'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='citizen')
    name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(unique=True)
    created_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='created_users'
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.name or self.email} ({self.role})"

class Vaccination(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    )
    vaccine_name = models.CharField(max_length=100)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='vaccinations')
    administered_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        related_name='administered_vaccinations', 
        null=True, 
        blank=True
    )
    administered_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.vaccine_name} - {self.user.email} ({self.status})"

class HealthRecord(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='health_record')
    blood_group = models.CharField(max_length=10)
    allergies = models.TextField(blank=True, default='')
    medical_history = models.TextField(blank=True, default='')
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, default='')

    def __str__(self):
        return f"Health Record of {self.user.email}"

class HealthCamp(models.Model):
    location = models.CharField(max_length=255)
    date = models.DateField()
    vaccine_type = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True, default='')

    def __str__(self):
        return f"Camp at {self.location} on {self.date}"

class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.email} - Read: {self.is_read}"

class CampRegistration(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='camp_registrations')
    camp = models.ForeignKey(HealthCamp, on_delete=models.CASCADE, related_name='registrations')
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'camp')

    def __str__(self):
        return f"{self.user.email} registered for {self.camp.vaccine_type} camp ({self.camp.location})"

