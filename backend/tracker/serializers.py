from rest_framework import serializers
from .models import CustomUser, Vaccination, HealthRecord, HealthCamp, Notification, CampRegistration

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'name', 'role', 'is_staff', 'created_by']
        read_only_fields = ['id', 'username', 'is_staff', 'created_by']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, default='citizen')

    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'password', 'role']

    def validate_email(self, value):
        email_clean = value.strip().lower()
        if CustomUser.objects.filter(email__iexact=email_clean).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email_clean

    def create(self, validated_data):
        email_clean = validated_data['email'].strip().lower()
        user = CustomUser.objects.create_user(
            email=email_clean,
            name=validated_data.get('name', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'citizen')
        )
        return user

class VaccinationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    administered_by_name = serializers.CharField(source='administered_by.name', read_only=True)

    class Meta:
        model = Vaccination
        fields = [
            'id', 'vaccine_name', 'due_date', 'status', 'user', 
            'user_email', 'user_name', 'administered_by', 'administered_by_name', 
            'administered_date'
        ]
        read_only_fields = ['id', 'user_email', 'user_name', 'administered_by_name']

    def validate(self, data):
        # Additional validation if status is completed, administered_date must be provided
        if data.get('status') == 'completed' and not data.get('administered_date'):
            raise serializers.ValidationError({"administered_date": "Administered date is required when vaccination is completed."})
        return data

class HealthRecordSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = HealthRecord
        fields = ['id', 'user', 'user_email', 'user_name', 'blood_group', 'allergies', 'medical_history', 'dob', 'gender']
        read_only_fields = ['id', 'user_email', 'user_name']

class HealthCampSerializer(serializers.ModelSerializer):
    registrations_count = serializers.IntegerField(source='registrations.count', read_only=True)
    registered_users = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = HealthCamp
        fields = ['id', 'location', 'date', 'vaccine_type', 'description', 'registrations_count', 'registered_users']

    def get_registered_users(self, obj):
        users = [reg.user for reg in obj.registrations.all()]
        return UserSerializer(users, many=True).data

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class CampRegistrationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    camp_location = serializers.CharField(source='camp.location', read_only=True)
    camp_vaccine_type = serializers.CharField(source='camp.vaccine_type', read_only=True)
    camp_date = serializers.CharField(source='camp.date', read_only=True)

    class Meta:
        model = CampRegistration
        fields = [
            'id', 'user', 'user_email', 'user_name', 'camp', 
            'camp_location', 'camp_vaccine_type', 'camp_date', 'registered_at'
        ]
        read_only_fields = ['id', 'user', 'registered_at']

    def validate(self, data):
        request = self.context.get('request')
        if request and request.user:
            target_user = request.user
            if request.user.role in ['health_worker', 'admin'] and 'user' in request.data:
                target_user_id = request.data['user']
                target_user = CustomUser.objects.filter(id=target_user_id).first()
            
            camp = data.get('camp')
            if target_user and camp:
                if CampRegistration.objects.filter(user=target_user, camp=camp).exists():
                    raise serializers.ValidationError("This user is already registered for this health camp.")
        return data


