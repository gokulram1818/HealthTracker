---
title: HealthTracker
sdk: docker
app_port: 7860
---

# HealthTracker

HealthTracker is a Django REST API with a React + Vite frontend for managing citizen health records, vaccination schedules, health camps, notifications, and role-based dashboards.

## Tech Stack

- Backend: Django, Django REST Framework, Simple JWT, SQLite
- Frontend: React, Vite, Axios, Bootstrap
- Deployment: Docker, Gunicorn, WhiteNoise

## Project Structure

```text
HealthTracker/
├── backend/                 # Django API
│   ├── backend/             # Django settings and URLs
│   ├── tracker/             # App models, serializers, views, routes
│   ├── manage.py
│   └── requirements.txt
├── frontend/HealthFrontend/ # React + Vite app
├── Dockerfile               # Hugging Face Spaces container
└── README.md
```

## Run Locally

### Backend

```powershell
cd backend
..\envi\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```powershell
cd frontend\HealthFrontend
npm install
npm run dev
```

The frontend development server uses `http://127.0.0.1:8000/api/` by default.

## Deploy To Hugging Face Spaces

1. Create a new Hugging Face Space.
2. Choose **Docker** as the Space SDK.
3. Upload this repository, including `Dockerfile`, `backend/requirements.txt`, and the frontend files.
4. Add a Space secret named `DJANGO_SECRET_KEY` with a strong random value.
5. The container will build the React app, run Django migrations, and start Gunicorn on `$PORT`.

The deployed app serves:

- React frontend at `/`
- Django admin at `/admin/`
- API endpoints at `/api/`

## Useful Docker Commands

Build locally:

```bash
docker build -t healthtracker .
```

Run locally:

```bash
docker run --rm -p 7860:7860 -e DJANGO_SECRET_KEY=local-dev-secret healthtracker
```

Open:

```text
http://127.0.0.1:7860
```

## Environment Variables

- `PORT`: server port. Hugging Face sets this automatically. Default: `7860`
- `DJANGO_SECRET_KEY`: Django secret key. Set this in Hugging Face Space secrets.
- `DJANGO_DEBUG`: set to `False` in Docker by default.
- `DJANGO_ALLOWED_HOSTS`: comma-separated host list. Defaults to `*` in Docker.
- `VITE_API_BASE_URL`: frontend API base URL at build time. Docker uses `/api/`.
- `VITE_BASE_PATH`: frontend asset base path at build time. Docker uses `/static/`.
