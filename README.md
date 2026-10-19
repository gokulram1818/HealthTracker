# 🏥 HealthTracker - Public Health & Immunization Management System

[![Django](https://img.shields.io/badge/Django-6.0-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)](LICENSE)

> A modern, full-stack, enterprise-grade Public Health & Immunization Management Portal designed to streamline healthcare access, automate vaccination schedule reminders, coordinate community health camps, and offer real-time analytics for health workers and administrators.

---

## 📌 Executive Summary

In traditional community healthcare systems, citizen vaccination tracking and health camp organizations face critical bottlenecks: missed immunizations due to lack of timely alerts, fragmented medical records, inefficient event management, and zero real-time oversight for administrative teams.

**HealthTracker** resolves these challenges by uniting **Citizens**, **Health Workers**, and **Administrators** under a secure, single-source-of-truth portal powered by a **React SPA** frontend and a **Django REST Framework** backend.

---

## ✨ Key Features & Role Workflows

### 🧑‍💼 1. Citizen Portal
- **Personalized Health Profile**: Maintain essential health metrics (blood group, allergies, medical history, DOB, gender).
- **Immunization Schedule Tracking**: Real-time visibility into pending, upcoming, and completed vaccination records.
- **Automated 7-Day Alert Engine**: In-app notifications automatically created for immunizations due within 7 days.
- **Community Health Camp Enrollment**: Self-service registration for local health camps with instant registration status.
- **Email Notifications**: Instant HTML welcome emails upon signup and instant confirmation emails for camp registrations.

### 🩺 2. Health Worker Dashboard
- **Citizen Management**: Manage public citizens or create private patient records managed specifically by the health worker.
- **Dose Administration**: Schedule due dates, update statuses, and log administered doses with exact timestamps and worker verification.
- **Patient Health Record Updates**: Inspect and update medical profiles and allergies for registered patients.
- **Camp Participant Registration**: Direct enrollment of citizens into upcoming community health camps on their behalf.

### 🛡️ 3. Administrator Hub
- **System-Wide Analytics**: Real-time breakdown of total citizens, health workers, camps, and vaccine completions.
- **Vaccine Breakdown Metrics**: Detailed count of completed vs. pending doses categorised by vaccine type.
- **User & Staff Governance**: Manage accounts across all roles with complete role-based permission control.
- **Community Camp Creation**: Organize new health camps with dates, vaccine types, locations, and details.

---

## 🏗️ System Architecture & Data Schema

### High-Level Architecture
```text
┌─────────────────────────────────────────────────────────────┐
│                      Client Tier                            │
│           React 19 + Vite 8 SPA (Bootstrap 5)               │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON / HTTP (Axios)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway & Backend                     │
│    Django REST Framework + SimpleJWT Token Authentication   │
└──────────────────────────────┬──────────────────────────────┘
                               │ ORM Queries
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data & External Tier                    │
│     SQLite Database  •  SMTP Email Service (TLS Port 587)   │
└─────────────────────────────────────────────────────────────┘
```

### Entity Relationship Model

- **`CustomUser`**: Extended user model supporting `citizen`, `health_worker`, and `admin` roles, with optional `created_by` for private patient scoping.
- **`HealthRecord`**: One-to-one link to `CustomUser` holding blood group, allergies, medical history, DOB, and gender.
- **`Vaccination`**: Stores vaccine name, due date, status (`pending`/`completed`), user reference, administered date, and worker attribution.
- **`HealthCamp`**: Community health events holding location, date, vaccine type, and description.
- **`CampRegistration`**: Join table enforcing unique user-to-camp registrations and tracking enrollment timestamps.
- **`Notification`**: System notification messages with read status, auto-generated when vaccinations are due within 7 days.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Python 3.13, Django 6.0 | Robust ORM, Security, and WSGI/ASGI application framework |
| **API Framework** | Django REST Framework (DRF) | RESTful API serialization, viewsets, and custom permissions |
| **Authentication** | SimpleJWT (`djangorestframework-simplejwt`) | JSON Web Token authorization headers (`Bearer <token>`) |
| **Frontend** | React 19, Vite 8, React Router v7 | Fast Single Page Application with dynamic client-side routes |
| **UI & Styling** | Bootstrap 5, Bootstrap Icons, Custom CSS | Responsive layout and accessible micro-interactions |
| **Database** | SQLite 3 | Embedded database for development and single-container deployments |
| **Notifications** | Django `EmailMultiAlternatives` | HTML and Plain Text SMTP email dispatch |
| **Web Server** | Gunicorn 23, WhiteNoise 6 | Production WSGI HTTP Server with static asset handling |
| **Containerization**| Docker (Multi-stage Node + Python) | Standardized container execution on Hugging Face / Render |

---

## 🌐 API Endpoint Reference

### Authentication & Profile
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Public | Register a new user account & send welcome email |
| `POST` | `/api/auth/login/` | Public | Obtain JWT Access and Refresh tokens |
| `POST` | `/api/auth/login/refresh/` | Public | Refresh expired JWT Access Token |
| `GET` | `/api/auth/me/` | Authenticated | Retrieve active user profile details |

### Health Records & Immunizations
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET/POST` | `/api/vaccinations/` | Authenticated | List or create vaccination records (Worker/Admin only for POST) |
| `PATCH` | `/api/vaccinations/{id}/` | Worker/Admin | Update vaccination status or log dose administration |
| `GET/PUT` | `/api/health-records/` | Authenticated | View or update personal/patient health records |
| `GET/PUT` | `/api/health-records/me/` | Citizen | Convenience route for active citizen's health profile |

### Community Camps & Registrations
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health-camps/` | Authenticated | List all upcoming community health camps |
| `POST` | `/api/health-camps/` | Worker/Admin | Create a new community health camp |
| `GET/POST` | `/api/camp-registrations/` | Authenticated | Enroll citizen in health camp & send confirmation email |
| `DELETE` | `/api/camp-registrations/{id}/` | Authenticated | Cancel camp registration |

### System Administration & Notifications
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/citizens/` | Worker/Admin | List citizens accessible by the requesting staff member |
| `GET/POST` | `/api/users/` | Worker/Admin | Create private citizen accounts (unusable password) |
| `GET` | `/api/notifications/` | Authenticated | Fetch notifications & auto-trigger 7-day overdue alerts |
| `PATCH` | `/api/notifications/{id}/` | Authenticated | Mark notification as read |
| `GET` | `/api/admin-dashboard/stats/` | Admin Only | System-wide performance and vaccine metrics |

---

## 🚀 Local Development Setup

### Prerequisites
- **Python**: `3.10` or higher (Python 3.13 recommended)
- **Node.js**: `18.x` or higher (Node.js 22 recommended)
- **Git**: Installed on system

### 1. Repository Setup
```bash
git clone https://github.com/gokulram1818/HealthTracker.git
cd HealthTracker
```

### 2. Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Create & activate Python virtual environment
python -m venv ..\envi
..\envi\Scripts\activate      # On Windows (cmd/powershell)
# source ../envi/bin/activate  # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Create an administrator account
python manage.py createsuperuser

# Start Django development server
python manage.py runserver
```
*Backend server runs at `http://127.0.0.1:8000/`*

### 3. Frontend Setup
```powershell
# Open a new terminal and navigate to frontend directory
cd frontend\HealthFrontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend app runs at `http://localhost:5173/` (or port configured by Vite).*

---

## 🧪 Running Unit & Integration Tests

The project includes an extensive test suite verifying JWT Auth, RBAC permissions, private patient visibility restrictions, camp registrations, unique constraints, and automated email outbox dispatches.

Run the complete backend test suite:
```powershell
cd backend
..\envi\Scripts\activate
python manage.py test tracker
```

---

## 🐳 Containerization & Production Deployment

### Option A: Docker Deployment (Local or Container Cloud)

The project includes a multi-stage `Dockerfile` that builds the React application and bundles it directly with Gunicorn and Django WhiteNoise static asset serving.

1. **Build Docker Image**:
   ```bash
   docker build -t healthtracker .
   ```

2. **Run Container Locally**:
   ```bash
   docker run --rm -p 7860:7860 -e DJANGO_SECRET_KEY=your-production-secret healthtracker
   ```
   *Access the full application at `http://127.0.0.1:7860`*

---

### Option B: Deploy to Hugging Face Spaces

1. Create a new Space on **Hugging Face**.
2. Select **Docker** as the Space SDK.
3. Push this repository to your Space.
4. Add a Space secret named `DJANGO_SECRET_KEY` under **Settings -> Variables and secrets**.
5. Hugging Face automatically builds the multi-stage container and exposes the app on port `7860`.

---

### Option C: Deploy to Render Web Services

1. Connect your repository to **Render**.
2. Render automatically detects `render.yaml`.
3. The build process uses the `Dockerfile` specification to construct and deploy the container.

---

## 🔑 Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `7860` | Server binding port (set automatically in Docker/HuggingFace) |
| `DJANGO_SECRET_KEY` | *Generated* | Cryptographic secret for session signing and tokens |
| `DJANGO_DEBUG` | `False` | Enable/Disable Django debug mode |
| `DJANGO_ALLOWED_HOSTS` | `*` | Comma-separated allowed host headers |
| `VITE_API_BASE_URL` | `/api/` | Frontend API base route used during Vite compilation |
| `VITE_BASE_PATH` | `/static/` | Frontend static asset path used during Vite compilation |
| `EMAIL_HOST_USER` | `""` | SMTP Username for sending notification emails |
| `EMAIL_HOST_PASSWORD` | `""` | SMTP App Password for sending notification emails |

---

## 📂 Project Structure

```text
HealthTracker/
├── backend/                         # Django Backend API
│   ├── backend/                     # Project configuration & settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── tracker/                     # Application app module
│   │   ├── emails.py                # SMTP Email templates & dispatchers
│   │   ├── models.py                # Database schema definitions
│   │   ├── serializers.py           # DRF Serializers
│   │   ├── tests.py                 # Comprehensive unit & integration tests
│   │   ├── urls.py                  # API endpoints router
│   │   └── views.py                 # DRF ViewSets & custom permissions
│   ├── manage.py
│   └── requirements.txt             # Python dependencies
├── frontend/HealthFrontend/         # React + Vite Frontend
│   ├── src/
│   │   ├── components/              # Navigation bar, footers, protected routes
│   │   ├── pages/                   # Citizen, Worker, Admin dashboards & forms
│   │   ├── context/                 # Auth state provider
│   │   ├── api.js                   # Axios base configuration
│   │   ├── App.jsx                  # Main routing component
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── Dockerfile                       # Multi-stage production container build
├── render.yaml                      # Render Infrastructure-as-Code config
├── presentation_content.md          # Project presentation guide & abstract
└── README.md                        # Documentation overview
```

---

## 📄 License & Acknowledgements

This project is open-source under the **MIT License**.

Designed and developed with ❤️ for public health workers, citizens, and healthcare administrators.
