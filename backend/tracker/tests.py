from django.urls import reverse
from django.core import mail
from rest_framework import status
from rest_framework.test import APITestCase
from tracker.models import CustomUser, Vaccination, HealthRecord, HealthCamp, Notification
import datetime


class TrackerAPITests(APITestCase):

    def setUp(self):
        # Create default users
        self.admin_user = CustomUser.objects.create_superuser(
            email='admin_test@health.com',
            password='password123',
            name='Test Admin'
        )
        self.worker_user = CustomUser.objects.create_user(
            email='worker_test@health.com',
            password='password123',
            name='Test Worker',
            role='health_worker'
        )
        self.citizen_user = CustomUser.objects.create_user(
            email='citizen_test@health.com',
            password='password123',
            name='Test Citizen',
            role='citizen'
        )
        
        # Paths
        self.register_url = reverse('auth_register')
        self.login_url = reverse('token_obtain_pair')
        self.profile_url = reverse('user_profile')
        self.citizen_list_url = reverse('citizen_list')
        self.admin_stats_url = reverse('admin_stats')
        
    def get_jwt_token(self, email, password):
        response = self.client.post(self.login_url, {'email': email, 'password': password}, format='json')
        return response.data['access']

    def test_user_registration(self):
        # Register a citizen
        data = {
            'name': 'New Citizen',
            'email': 'new_citizen@health.com',
            'password': 'password123',
            'role': 'citizen'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['email'], 'new_citizen@health.com')
        
        # Verify an empty HealthRecord was auto-created
        user = CustomUser.objects.get(email='new_citizen@health.com')
        self.assertTrue(HealthRecord.objects.filter(user=user).exists())

    def test_user_login(self):
        data = {
            'email': 'citizen_test@health.com',
            'password': 'password123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['role'], 'citizen')

    def test_user_profile(self):
        token = self.get_jwt_token('citizen_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'citizen_test@health.com')

    def test_citizen_list_permissions(self):
        # Citizen should not be allowed to list citizens
        token = self.get_jwt_token('citizen_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get(self.citizen_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Worker should be allowed
        token = self.get_jwt_token('worker_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get(self.citizen_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_vaccination_crud(self):
        # 1. Citizen tries to create a vaccination (Denied)
        token = self.get_jwt_token('citizen_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        vac_data = {
            'vaccine_name': 'MMR',
            'due_date': '2026-06-01',
            'status': 'pending',
            'user': self.citizen_user.id
        }
        response = self.client.post('/api/vaccinations/', vac_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Worker creates vaccination (Allowed)
        token = self.get_jwt_token('worker_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.post('/api/vaccinations/', vac_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        vac_id = response.data['id']

        # 3. Citizen reads their own vaccinations (Allowed)
        token = self.get_jwt_token('citizen_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get('/api/vaccinations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['vaccine_name'], 'MMR')

        # 4. Worker marks vaccination as completed (Allowed)
        token = self.get_jwt_token('worker_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        update_data = {
            'status': 'completed',
            'administered_date': '2026-05-20'
        }
        response = self.client.patch(f'/api/vaccinations/{vac_id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'completed')
        self.assertEqual(response.data['administered_by'], self.worker_user.id)

    def test_health_record_access(self):
        # Initial record setup for citizen
        hr = HealthRecord.objects.create(
            user=self.citizen_user,
            blood_group='O+',
            allergies='None',
            medical_history='None'
        )

        # 1. Citizen updates their own record (Allowed)
        token = self.get_jwt_token('citizen_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.put(f'/api/health-records/{hr.id}/', {
            'blood_group': 'O-',
            'allergies': 'Peanuts',
            'medical_history': 'None',
            'user': self.citizen_user.id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['blood_group'], 'O-')

        # 2. Worker fetches health records (Allowed)
        token = self.get_jwt_token('worker_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get('/api/health-records/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_health_camp_crud(self):
        # 1. Citizen retrieves camps (Allowed)
        token = self.get_jwt_token('citizen_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get('/api/health-camps/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 2. Citizen tries to create a camp (Denied)
        camp_data = {
            'location': 'Community Hall',
            'date': '2026-06-10',
            'vaccine_type': 'Influenza'
        }
        response = self.client.post('/api/health-camps/', camp_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Worker creates a camp (Allowed)
        token = self.get_jwt_token('worker_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.post('/api/health-camps/', camp_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_notification_auto_generation(self):
        # Create a vaccination due in 3 days
        due_soon = datetime.date.today() + datetime.timedelta(days=3)
        Vaccination.objects.create(
            vaccine_name='Polio Booster',
            due_date=due_soon,
            status='pending',
            user=self.citizen_user
        )

        # Fetch notifications as citizen. Queryset evaluation should trigger auto-notification creation.
        token = self.get_jwt_token('citizen_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        
        # Check initial notifications (should generate)
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn('Polio Booster', response.data[0]['message'])

        # Mark notification as read
        notif_id = response.data[0]['id']
        response = self.client.patch(f'/api/notifications/{notif_id}/', {'is_read': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_read'])

    def test_admin_dashboard_stats(self):
        # 1. Worker tries to view admin stats (Denied)
        token = self.get_jwt_token('worker_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get(self.admin_stats_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Admin retrieves stats (Allowed)
        token = self.get_jwt_token('admin_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get(self.admin_stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_citizens', response.data)
        self.assertIn('vaccinations', response.data)
        self.assertIn('users', response.data)

    def test_camp_registrations(self):
        # Create a health camp
        camp = HealthCamp.objects.create(
            location='Main Hall',
            date='2026-06-12',
            vaccine_type='Hepatitis B'
        )

        # 1. Citizen registers for the camp (Allowed)
        token = self.get_jwt_token('citizen_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.post('/api/camp-registrations/', {'camp': camp.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        reg_id = response.data['id']

        # 2. Try to register for same camp again (Unique constraint error)
        response = self.client.post('/api/camp-registrations/', {'camp': camp.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # 3. Health Worker lists registrations (Allowed)
        token = self.get_jwt_token('worker_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get('/api/camp-registrations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # 4. Try to register a non-citizen (Worker) for the camp (Denied)
        response = self.client.post('/api/camp-registrations/', {'camp': camp.id, 'user': self.worker_user.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # 5. Citizen cancels registration (Allowed)
        token = self.get_jwt_token('citizen_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.delete(f'/api/camp-registrations/{reg_id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_private_patient_creation(self):
        # 1. Health Worker A registers a private patient
        token_a = self.get_jwt_token('worker_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token_a)
        
        patient_data = {
            'name': 'Private Patient',
            'email': 'private_patient@health.com'
        }
        response = self.client.post('/api/users/', patient_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        patient_id = response.data['id']
        
        # Verify the created patient has unusable password (cannot log in)
        patient_user = CustomUser.objects.get(id=patient_id)
        self.assertFalse(patient_user.has_usable_password())
        self.assertEqual(patient_user.created_by, self.worker_user)
        
        # Verify HealthRecord is auto-created
        self.assertTrue(HealthRecord.objects.filter(user=patient_user).exists())
        
        # 2. Verify Health Worker B cannot see this patient
        worker_b = CustomUser.objects.create_user(
            email='worker_b@health.com',
            password='password123',
            name='Test Worker B',
            role='health_worker'
        )
        token_b = self.get_jwt_token('worker_b@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token_b)
        
        # Get citizens list - should NOT include the private patient
        response = self.client.get('/api/citizens/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Standard citizen is visible (citizen_test@health.com), but private patient should not be.
        emails = [c['email'] for c in response.data]
        self.assertIn('citizen_test@health.com', emails)
        self.assertNotIn('private_patient@health.com', emails)
        
        # Try to retrieve the private patient directly (should be 404 since it's filtered out of queryset)
        response = self.client.get(f'/api/users/{patient_id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_portal_registration_email_sent(self):
        mail.outbox.clear()
        data = {
            'name': 'Mail Test User',
            'email': 'mailtest@health.com',
            'password': 'password123',
            'role': 'citizen'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify email in outbox
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertIn('Welcome to Health Tracker', sent_email.subject)
        self.assertEqual(sent_email.to, ['mailtest@health.com'])

    def test_camp_registration_email_sent(self):
        camp = HealthCamp.objects.create(
            location='Central Park',
            date='2026-07-01',
            vaccine_type='COVID-19 Booster'
        )

        mail.outbox.clear()
        # Admin registers citizen for camp
        token = self.get_jwt_token('admin_test@health.com', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        
        response = self.client.post('/api/camp-registrations/', {'camp': camp.id, 'user': self.citizen_user.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify email in outbox
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertIn('Health Camp Registration Confirmation', sent_email.subject)
        self.assertEqual(sent_email.to, ['citizen_test@health.com'])


