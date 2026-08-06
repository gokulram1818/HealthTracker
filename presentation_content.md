# Health Tracker - Project Presentation Content

---

## 1. Abstract
The **Health Tracker** portal is a modern, web-based Public Health & Immunization Management System engineered to bridge the communication and tracking gap between citizens, health workers, and administrators. Built with a **React (Vite)** frontend and a **Django REST Framework** backend, the system centralizes health record maintenance, vaccination schedule tracking, health camp registrations, and automated email notifications. Citizens can monitor their immunization timelines and enroll in community health camps, while health workers and administrators manage patient records, track vaccine administration, and analyze community health metrics. The platform enhances healthcare accessibility, reduces missed vaccination rates through automated alerts, and simplifies community health camp organization.

---

## 2. Problem Statement & Expected Outcomes

### Problem Statement
In traditional community healthcare systems, managing citizen vaccination schedules and conducting health camps faces several critical challenges:
- **Missed Immunizations**: Citizens lack centralized, automated reminders for upcoming or overdue vaccines.
- **Fragmented Health Records**: Paper-based or decentralized records make patient history tracking error-prone and inaccessible across healthcare workers.
- **Inefficient Camp Organization**: Health camps lack streamlined digital registration processes, leading to overcrowding or low attendance due to poor notification systems.
- **Lack of Centralized Oversight**: Healthcare administrators lack real-time data visibility into regional vaccination completion rates and health worker activity.

### Expected Outcomes
- **Automated Communication**: Instant email notifications dispatched upon portal signup and camp enrollment.
- **Centralized Health Records**: Secure, single-source-of-truth health profiles (blood group, allergies, medical history, DOB, gender) for citizens.
- **Enhanced Immunization Coverage**: Timely alerts for pending vaccinations due within 7 days.
- **Streamlined Camp Management**: Simple digital registration for community health camps with capacity and participant tracking.
- **Data-Driven Administration**: Admin dashboard analytics providing insights into vaccine completion rates, camp registrations, and user distributions.

---

## 3. Module Description

The system is architected into 5 core modules:

1. **User Authentication & Role-Based Access Control (RBAC) Module**:
   - Handles secure JWT-based authentication (`rest_framework_simplejwt`).
   - Supports three user roles: **Citizen**, **Health Worker**, and **Admin**.
   - Admin/Worker creation of private citizen accounts with restricted visibility boundaries.

2. **Immunization & Vaccination Tracking Module**:
   - Maintains scheduled, pending, and completed vaccination records.
   - Allows health workers and admins to log administered doses with exact dates and administrator details.

3. **Health Records Management Module**:
   - Maintains personal medical profiles (blood group, allergies, medical history, DOB, gender).
   - Citizen self-service view and worker/admin update permissions.

4. **Health Camp & Event Registration Module**:
   - Facilitates camp creation (location, date, vaccine type, description).
   - Allows self-registration by citizens as well as direct registration by health workers/admins on behalf of citizens.
   - Prevents duplicate camp enrollments.

5. **Notification & Automated Email Dispatch Module**:
   - In-app notification engine that auto-detects upcoming vaccinations within 7 days.
   - SMTP Email integration delivering rich HTML and plain-text emails for portal welcome and camp registration confirmations.

---

## 4. Software and Hardware Specifications

### Hardware Specifications (Minimum Requirements)

#### Developer / Server Environment:
- **Processor**: Dual-Core 2.0 GHz (Intel i3 / AMD Ryzen 3 or equivalent)
- **RAM**: 4 GB minimum (8 GB recommended)
- **Storage**: 1 GB available disk space (SSD recommended)
- **Network**: Internet connection for SMTP email dispatch and API requests

#### Client / User Device:
- **Device**: Smartphone, Tablet, Laptop, or Desktop
- **Display Resolution**: 1024 x 768 minimum (Responsive UI)
- **Network**: Stable 3G/4G/5G or Wi-Fi connection

### Software Specifications

#### Frontend Stack:
- **Framework**: React 18+ (bundled with Vite)
- **Styling**: Tailwind CSS & Lucide Icons
- **HTTP Client**: Axios / Fetch API

#### Backend Stack:
- **Language**: Python 3.10+ (Tested on Python 3.13)
- **Framework**: Django 6.0+ & Django REST Framework (DRF)
- **Authentication**: `djangorestframework-simplejwt`
- **CORS Management**: `django-cors-headers`
- **Email Engine**: Django `EmailMultiAlternatives` via SMTP (TLS Port 587)

#### Database & Server:
- **Database**: SQLite 3 (`db.sqlite3`)
- **WSGI/ASGI**: Django Built-in Dev Server / Gunicorn / WhiteNoise (Static Assets)

---

## 5. System Design

### Architecture Overview
The application follows a decoupled **Client-Server Architecture**:
- **Client Tier**: Single Page Application (SPA) built with React, consuming RESTful JSON APIs.
- **API Gateway / Backend Tier**: Django REST Framework serving endpoints protected by JWT Bearer tokens and role-based permissions.
- **Data Tier**: SQLite database managed via Django ORM.
- **External Services**: SMTP Mail Server (Gmail) for delivering real-time notification emails.

### Key API Endpoints & Flow
- `POST /api/auth/register/` -> Creates user & triggers `send_portal_registration_email()`
- `POST /api/token/` -> Issues JWT access and refresh tokens
- `GET/POST /api/health-camps/` -> Manages community health camp events
- `POST /api/camp-registrations/` -> Registers citizens for camps & triggers `send_camp_registration_email()`
- `GET /api/admin-stats/` -> Computes breakdown metrics for administrator dashboard
