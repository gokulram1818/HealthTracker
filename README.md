# 🏥 HealthTracker (AuraStride Ecosystem)

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React Version](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb.svg)](https://reactjs.org/)
[![Django REST Framework](https://img.shields.io/badge/backend-Django%20REST-green.svg)](https://www.django-rest-framework.org/)

> **HealthTracker** is a modern, unified digital health ecosystem designed to bridge the gap between citizens, healthcare workers, and administrators. Seamlessly track vaccinations, manage health records, coordinate health camps, and deliver real-time notifications.

---

## 🚀 Repository Overview

This repository is structured as a single monorepo housing both the backend and frontend services:

```
HealthTracker/
├── backend/             # Django REST API Service
│   ├── backend/         # Main settings, URLs, and configurations
│   ├── tracker/         # Core Django application logic (Models, Views, Serializers)
│   ├── manage.py        # Django CLI wrapper
│   └── seed.py          # Database seeding script
├── frontend/            # React + Vite Client Application
│   └── HealthFrontend/  # React source code, components, routes, and styles
└── envi/                # Python Virtual Environment (ignored in git)
```

---

## 🛠️ Tech Stack

### Backend
* **Framework**: Django & Django REST Framework (DRF)
* **Database**: SQLite3 (Development) / PostgreSQL compatible
* **Authentication**: JWT (JSON Web Tokens) with `django-rest-framework-simplejwt`

### Frontend
* **Core**: React 18+ (Vite builder)
* **Routing**: React Router DOM (with protected route structures)
* **Styling**: Vanilla CSS with custom modern glassmorphic design systems
* **API Client**: Axios configured with interceptors for JWT state handling

---

## ✨ Features & Architecture

* **🔑 Unified Authentication**: Secure login and registration with Role-Based Access Control (RBAC).
* **👤 Citizen Dashboard**:
  * View personal health history.
  * Register for local health camps.
  * Track upcoming vaccination schedules.
* **🩺 Health Worker Portal**:
  * Manage and update citizen health records.
  * Schedule vaccinations and health camp tasks.
* **📊 Admin Command Center**:
  * Complete operational oversight of health workers, camps, and system-wide notifications.
* **🔔 Live Notifications**: Alerts for new camp schedules, vaccine updates, and system messages.

---

## ⚡ Quickstart Guide

### 1. Prerequisite Setup
Ensure you have **Node.js** (v18+) and **Python** (v3.10+) installed.

### 2. Backend Installation (Django)
Navigate to the backend directory:
```bash
cd backend
```
Set up your virtual environment & dependencies:
```bash
# If using the existing 'envi' environment:
..\envi\Scripts\activate

# Install Django & other requirements
pip install -r requirements.txt # (or install django, djangorestframework, djangorestframework-simplejwt, django-cors-headers)
```
Run migrations and spin up the server:
```bash
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Installation (React)
Open a new terminal and navigate to the frontend folder:
```bash
cd frontend/HealthFrontend
```
Install NPM packages and launch the dev server:
```bash
npm install
npm run dev
```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
