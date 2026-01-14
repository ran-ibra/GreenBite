# GreenBite

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![License](https://img.shields.io/badge/license-SEE_LICENSE_file-lightgrey)

Modern open-source backend and frontend for a nutrition & meal-planning app.

This repository contains two main parts:

- `GreenBite-backend/` — Django REST API (JWT auth, Celery, Postgres, Redis, MinIO)
- `GreenBite-frontend/` — React + Vite frontend

**Status:** active development — use the backend and frontend READMEs for component-specific details.

## Why GreenBite

- Production-ready patterns: Django REST Framework, JWT, Celery, Redis, Postgres
- Extensible food/recipes/meal-plans domain model with background tasks and embeddings
- Local development via `docker-compose` or native Python / Node workflows

## Key features

- REST API with authentication and account management
- Background workers (Celery) and scheduled tasks (celery-beat)
- Object storage support (MinIO / S3-compatible)
- React frontend scaffolded with Vite and Tailwind tooling

## Quick start

Two supported development flows: local (native) and containerized (recommended for parity).

Prerequisites:

- Docker & Docker Compose (for containerized setup)
- Python 3.11+, pip and virtualenv (for native backend)
- Node 18+ and npm/yarn (for native frontend)

### Containerized (recommended)

1. Build and start services:

```bash
docker-compose up --build
```

This brings up the backend, database (Postgres), Redis, MinIO and Celery workers as configured in `docker-compose.yml`.

Environment values are loaded from `GreenBite-backend/.env` when running via Docker Compose.

### Native backend (local Python)

1. Change into the backend folder and create a venv:

```bash
cd GreenBite-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Create a `.env` file next to `manage.py` (see `GreenBite-backend/README.md` for examples).

3. Run migrations and start the server:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Native frontend (local Node)

1. Install and run the frontend dev server:

```bash
cd GreenBite-frontend
npm install
npm run dev
```

By default the frontend expects the API to be available (configure proxy or set API base URL in the app configuration).

## Project layout

- `GreenBite-backend/` — Django project, `manage.py`, `project/settings.py`, and apps (`accounts`, `food`, `recipes`, ...)
- `GreenBite-frontend/` — React app scaffolded with Vite
- `docker-compose.yml` — local multi-service dev stack (Postgres, Redis, MinIO, Celery)

For more details see the component READMEs:

- Backend: GreenBite-backend/GreenBite-backend/README.md
- Frontend: GreenBite-backend/GreenBite-frontend/README.md

## Configuration & environment

- The Django backend reads environment variables from a `.env` file (see `GreenBite-backend/project/settings.py`).
- Important variables: `SECRET_KEY`, `DEBUG`, DB connection variables, `REDIS_URL`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and any third-party API keys (OpenAI, Paymob).

Do not commit secrets. Add a `.env.example` with placeholders for onboarding.

## Running tests

- Backend tests: run `python manage.py test` inside `GreenBite-backend` (ensure dependencies and DB are available).
- Frontend tests: (not included by default) follow typical React testing setup and scripts in `GreenBite-frontend/package.json`.

## Where to get help

- Open an issue in this repository for bugs or feature requests.
- Pull requests are welcome — please describe the change and include tests where appropriate.

For component-level details, check the component READMEs listed above.

## Maintainers & contributing

- Maintainers: See repository owners and collaborators in GitHub (or add a `CONTRIBUTING.md` to this repo).
- Contribution workflow:
  - Fork the repository, create a feature branch, and open a pull request
  - Keep changes focused and include tests for backend changes
  - Ensure linting and basic checks pass

Add a `CONTRIBUTING.md` at the repository root to document coding style, review expectations, and commit message guidelines.

## License

See the `LICENSE` file in this repository for license details.

---

If you'd like, I can also create a short `CONTRIBUTING.md` template and add a `docs/` folder for developer onboarding. Would you like me to add those next?
