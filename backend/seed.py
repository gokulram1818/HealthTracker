import os
import django
import datetime

os.environ.setdefault('DJANGO_SETTINGS_SETTINGS', 'backend.settings')
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
django.setup()

from tracker.models import CustomUser, HealthCamp, Vaccination, HealthRecord, Notification

def seed():
    # Create admin
    if not CustomUser.objects.filter(email='admin@health.com').exists():
        admin = CustomUser.objects.create_superuser('admin@health.com', 'admin123', name='Admin User')
        print("Admin user created (admin@health.com / admin123)")
    else:
        admin = CustomUser.objects.get(email='admin@health.com')

    # Create health worker
    if not CustomUser.objects.filter(email='worker@health.com').exists():
        worker = CustomUser.objects.create_user('worker@health.com', 'worker123', name='Dr. Sarah Jenkins', role='health_worker')
        print("Worker user created (worker@health.com / worker123)")
    else:
        worker = CustomUser.objects.get(email='worker@health.com')

    # Create citizen
    if not CustomUser.objects.filter(email='citizen@health.com').exists():
        citizen = CustomUser.objects.create_user('citizen@health.com', 'citizen123', name='John Doe', role='citizen')
        # Update health record
        hr, _ = HealthRecord.objects.get_or_create(user=citizen)
        hr.blood_group = 'O+'
        hr.allergies = 'Penicillin, Peanuts'
        hr.medical_history = 'Asthma diagnosed in childhood'
        hr.save()
        print("Citizen user created (citizen@health.com / citizen123)")

        # Add some vaccination records for citizen
        Vaccination.objects.create(
            vaccine_name='BCG (Tuberculosis)',
            due_date=datetime.date(2026, 1, 15),
            status='completed',
            user=citizen,
            administered_by=worker,
            administered_date=datetime.date(2026, 1, 15)
        )
        Vaccination.objects.create(
            vaccine_name='Hepatitis B (Dose 1)',
            due_date=datetime.date(2026, 2, 20),
            status='completed',
            user=citizen,
            administered_by=worker,
            administered_date=datetime.date(2026, 2, 20)
        )
        # Polio soon (within 7 days of 2026-05-20 is great, say 2026-05-25)
        Vaccination.objects.create(
            vaccine_name='Polio Vaccine (OPV-1)',
            due_date=datetime.date(2026, 5, 25),
            status='pending',
            user=citizen
        )
        Vaccination.objects.create(
            vaccine_name='MMR Vaccine (Measles, Mumps, Rubella)',
            due_date=datetime.date(2026, 8, 10),
            status='pending',
            user=citizen
        )
        print("Vaccinations seeded for John Doe")

    # Add some health camps
    if not HealthCamp.objects.exists():
        HealthCamp.objects.create(
            location='Greenwood Community Center, Sector 4',
            date=datetime.date(2026, 6, 5),
            vaccine_type='Polio & Influenza',
            description='Free polio immunization camp for children under 5 and seasonal influenza shots for seniors.'
        )
        HealthCamp.objects.create(
            location='St. Jude Clinic, Main Street',
            date=datetime.date(2026, 6, 20),
            vaccine_type='Hepatitis B & Tdap',
            description='Walk-in health camp offering booster doses of Hepatitis B and Tdap vaccines for adults.'
        )
        print("Health camps created")

if __name__ == '__main__':
    seed()
