FROM node:22-slim AS frontend-build

WORKDIR /app/frontend/HealthFrontend

COPY frontend/HealthFrontend/package*.json ./
RUN npm install

COPY frontend/HealthFrontend/ ./
ENV VITE_API_BASE_URL=/api/
ENV VITE_BASE_PATH=/static/
RUN npm run build


FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_DEBUG=False
ENV DJANGO_ALLOWED_HOSTS=*
ENV PORT=7860

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/HealthFrontend/dist ./frontend/HealthFrontend/dist

WORKDIR /app/backend
RUN python manage.py collectstatic --noinput

EXPOSE 7860

CMD ["sh", "-c", "python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:${PORT} --workers 1 --threads 2 --timeout 120 --max-requests 500 --max-requests-jitter 50"]
