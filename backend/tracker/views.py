from rest_framework import viewsets, permissions, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import models
from datetime import date, timedelta

from .models import CustomUser, Vaccination, HealthRecord, HealthCamp, Notification, CampRegistration
from .serializers import (
    UserSerializer, RegisterSerializer, VaccinationSerializer, 
    HealthRecordSerializer, HealthCampSerializer, NotificationSerializer, CampRegistrationSerializer
)
from .emails import send_portal_registration_email, send_camp_registration_email

# Custom Permissions
class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class IsHealthWorkerUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.role == 'health_worker' or request.user.role == 'admin')

class IsCitizenUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'citizen'

class IsAdminOrHealthWorkerForCitizens(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'admin':
            return True
        if request.user.role == 'health_worker':
            return view.action in ['list', 'retrieve', 'update', 'partial_update', 'create']
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if request.user.role == 'health_worker':
            return obj.role == 'citizen' and (obj.created_by is None or obj.created_by == request.user)
        return False

# Custom JWT Authentication Views
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'name': self.user.name,
            'role': self.user.role,
            'is_staff': self.user.is_staff
        }
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Registration View
class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # If user is a citizen, initialize an empty health record
        if user.role == 'citizen':
            HealthRecord.objects.get_or_create(
                user=user,
                defaults={'blood_group': 'Not Specified', 'allergies': '', 'medical_history': '', 'dob': None, 'gender': ''}
            )

        # Send welcome email notification
        send_portal_registration_email(user)

        return Response(
            {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "role": user.role
                },
                "message": "User registered successfully."
            },
            status=status.HTTP_201_CREATED
        )

# Profile View
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# Citizen List view (For Workers/Admins to assign vaccinations)
class CitizenListView(generics.ListAPIView):
    permission_classes = [IsHealthWorkerUserRole]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return CustomUser.objects.filter(role='citizen').order_by('name')
        # Health workers see public citizens (created_by is null) + private citizens created by themselves
        return CustomUser.objects.filter(
            models.Q(role='citizen') & (models.Q(created_by__isnull=True) | models.Q(created_by=user))
        ).order_by('name')

# Vaccination ViewSet
class VaccinationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VaccinationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'citizen':
            return Vaccination.objects.filter(user=user).order_by('due_date')
        if user.role == 'admin':
            return Vaccination.objects.all().order_by('due_date')
        # Health Workers see vaccinations for public citizens + private citizens created by themselves
        return Vaccination.objects.filter(
            models.Q(user__created_by__isnull=True) | models.Q(user__created_by=user)
        ).order_by('due_date')

    def perform_create(self, serializer):
        # Health Worker / Admin adds a record
        if self.request.user.role in ['health_worker', 'admin']:
            if serializer.validated_data.get('status') == 'completed':
                serializer.save(
                    administered_by=self.request.user,
                    administered_date=serializer.validated_data.get('administered_date', date.today())
                )
            else:
                serializer.save()
        else:
            # Citizens shouldn't manually create vaccinations for themselves via API
            raise permissions.exceptions.PermissionDenied("Only health workers and admins can add vaccinations.")

    def perform_update(self, serializer):
        if self.request.user.role in ['health_worker', 'admin']:
            if serializer.validated_data.get('status') == 'completed':
                serializer.save(
                    administered_by=self.request.user,
                    administered_date=serializer.validated_data.get('administered_date', date.today())
                )
            else:
                serializer.save()
        else:
            raise permissions.exceptions.PermissionDenied("Only health workers and admins can update vaccinations.")

# HealthRecord ViewSet
class HealthRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HealthRecordSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'citizen':
            return HealthRecord.objects.filter(user=user)
        if user.role == 'admin':
            return HealthRecord.objects.all()
        # Health Workers see records for public citizens + private citizens created by themselves
        return HealthRecord.objects.filter(
            models.Q(user__created_by__isnull=True) | models.Q(user__created_by=user)
        )

    def get_object(self):
        # Special support for citizens fetching their own record using 'me' or ID
        pk = self.kwargs.get('pk')
        if pk == 'me' or self.request.user.role == 'citizen':
            obj, created = HealthRecord.objects.get_or_create(
                user=self.request.user,
                defaults={'blood_group': 'Not Specified', 'allergies': '', 'medical_history': '', 'dob': None, 'gender': ''}
            )
            return obj
        obj = super().get_object()
        # Check permissions for health workers
        if self.request.user.role == 'health_worker':
            if obj.user.created_by and obj.user.created_by != self.request.user:
                raise permissions.exceptions.PermissionDenied("You do not have access to this patient record.")
        return obj

    def perform_update(self, serializer):
        # Users can update their own record, workers/admins can update any
        obj = self.get_object()
        if self.request.user.role in ['health_worker', 'admin'] or obj.user == self.request.user:
            serializer.save()
        else:
            raise permissions.exceptions.PermissionDenied("Not authorized to update this health record.")

# HealthCamp ViewSet
class HealthCampViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HealthCampSerializer
    queryset = HealthCamp.objects.all().order_by('date')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsHealthWorkerUserRole]
        return [permission() for permission in permission_classes]

# Notification ViewSet
class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'citizen':
            # Check for upcoming vaccinations due within 7 days, or overdue, and auto-generate notifications
            upcoming = Vaccination.objects.filter(
                user=user,
                status='pending',
                due_date__lte=date.today() + timedelta(days=7)
            )
            for vac in upcoming:
                msg = f"Reminder: Your vaccination '{vac.vaccine_name}' is due on {vac.due_date}."
                if not Notification.objects.filter(user=user, message=msg).exists():
                    Notification.objects.create(user=user, message=msg)

        return Notification.objects.filter(user=user).order_by('-created_at')

    def perform_update(self, serializer):
        # Ensure they can only update their own notifications
        obj = self.get_object()
        if obj.user == self.request.user:
            serializer.save()
        else:
            raise permissions.exceptions.PermissionDenied("Not authorized to update this notification.")

# Admin Stats View
class AdminStatsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        total_citizens = CustomUser.objects.filter(role='citizen').count()
        total_workers = CustomUser.objects.filter(role='health_worker').count()
        total_camps = HealthCamp.objects.count()
        
        completed_vaccinations = Vaccination.objects.filter(status='completed').count()
        pending_vaccinations = Vaccination.objects.filter(status='pending').count()
        
        # Breakdown by vaccine name
        vaccines = Vaccination.objects.values('vaccine_name').annotate(
            completed=models.Count('id', filter=models.Q(status='completed')),
            pending=models.Count('id', filter=models.Q(status='pending')),
            total=models.Count('id')
        )
        
        # User List
        users_list = CustomUser.objects.all().order_by('role', 'name')
        users_data = UserSerializer(users_list, many=True).data
        
        return Response({
            "total_citizens": total_citizens,
            "total_workers": total_workers,
            "total_camps": total_camps,
            "vaccinations": {
                "completed": completed_vaccinations,
                "pending": pending_vaccinations,
                "total": completed_vaccinations + pending_vaccinations
            },
            "vaccine_breakdown": list(vaccines),
            "users": users_data
        })

# User ViewSet (For Admins & Health Workers acting on Citizens)
class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrHealthWorkerForCitizens]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return CustomUser.objects.all().order_by('role', 'name')
        # Health Workers can only see public citizens + private citizens created by themselves
        return CustomUser.objects.filter(
            models.Q(role='citizen') & (models.Q(created_by__isnull=True) | models.Q(created_by=user))
        ).order_by('name')

    def perform_create(self, serializer):
        if self.request.user.role == 'health_worker':
            # Create a private citizen user with unusable password
            user = serializer.save(
                role='citizen', 
                created_by=self.request.user,
                username=serializer.validated_data.get('email')
            )
            user.set_unusable_password()
            user.save()
            
            # Auto-create HealthRecord
            HealthRecord.objects.get_or_create(
                user=user,
                defaults={'blood_group': 'Not Specified', 'allergies': '', 'medical_history': '', 'dob': None, 'gender': ''}
            )
        else:
            # Admin flow
            user = serializer.save(username=serializer.validated_data.get('email'))
            user.set_unusable_password()
            user.save()
            if user.role == 'citizen':
                HealthRecord.objects.get_or_create(
                    user=user,
                    defaults={'blood_group': 'Not Specified', 'allergies': '', 'medical_history': '', 'dob': None, 'gender': ''}
                )
        
        # Send portal registration email
        send_portal_registration_email(user)

# CampRegistration ViewSet
class CampRegistrationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CampRegistrationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'citizen':
            return CampRegistration.objects.filter(user=user).order_by('-registered_at')
        return CampRegistration.objects.all().order_by('-registered_at')

    def perform_create(self, serializer):
        user = self.request.user
        target_user = user
        if user.role in ['health_worker', 'admin'] and 'user' in self.request.data:
            from django.shortcuts import get_object_or_404
            target_user = get_object_or_404(CustomUser, id=self.request.data['user'])
        
        if target_user.role != 'citizen':
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Only citizens can be registered for health camps.")
            
        camp_reg = serializer.save(user=target_user)
        
        # Send camp registration email notification
        send_camp_registration_email(target_user, camp_reg.camp, registered_by=user)



