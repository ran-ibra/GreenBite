# 🌱 GreenBite 

GreenBite is a **full-stack web platform** focused on **food-waste reduction** through smart food logging, recipe & meal planning, AI-assisted recommendations, and a community marketplace.

---

## 🏗️ 1) System Architecture

```

🖥️  React (Vite)
│
│  REST APIs (JWT)
▼
⚙️  Django REST Framework
│
├─  PostgreSQL (Primary DB)
├─  Redis (Cache & Broker)
├─  Celery Workers (Async jobs)
├─  Celery Beat (Scheduled jobs)
├─  MinIO / S3 (Media storage – supported)
└─  AI Integrations (OpenAI / ML / CV)

````

---

## 🧰 2) Tech Stack (Actual)

### 🔙 Backend
-  Python
-  Django
-  Django REST Framework
-  JWT Authentication (`simplejwt`)
-  API Docs (`drf-yasg`)
-  PostgreSQL
-  Redis
-  Celery + Celery Beat + Celery Results
-  pgvector
-  OpenAI SDK
-  Pillow
-  boto3 (S3 / MinIO)
-  Docker

### 🎨 Frontend
-  React
-  Vite
-  React Router
-  React Query
-  Axios
-  Tailwind CSS
-  Flowbite React
-  Framer Motion

---

## 🗂️ 3) Repository Structure (Actual)

```text
/
├──  GreenBite-backend/
│   ├──  accounts/              # Authentication & user accounts
│   ├──  food/                  # Food logging & waste logic
│   ├──  recipes/               # Recipe domain
│   ├──  meal_plans/            # Meal planning logic
│   ├──  community/             # Marketplace & community features
│   ├──  subscriptions/         # Subscription rules
│   ├──  payments/              # Payment logic
│   ├──  project/               # Django settings & URLs
│   ├──  celerybeat-schedule     # Celery Beat DB file
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── .env                      # Environment variables (not committed)
│
└──  GreenBite-frontend/
    ├── src/
    │   ├──  api/               # Axios clients & endpoints
    │   ├──  services/          # Service wrappers
    │   ├──  routes/            # Route guards
    │   ├──  pages/             # App pages
    │   ├──  components/        # UI components
    │   ├──  layouts/           # Layout wrappers
    │   ├──  context/            # Global contexts
    │   ├──  reducers/          # State reducers
    │   ├──  hooks/              # Custom hooks
    │   ├──  theme/              # Theme configuration
    │   ├──  assets/             # Images & static assets
    │   └──  utils/              # Utilities
    ├── public/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── Dockerfile
````

---

## 🔐 4) Authentication & Authorization

*  JWT-based authentication
*  Access & refresh tokens
* 🧑‍🤝‍🧑 Roles:

  * Normal user
  * Seller (subscribed)
  * Admin

### 🧭 Frontend Route Guards

* `PublicRoute`
* `ProtectedRoute`
* `SubscriptionRoute`

### 🛡️ Backend

* DRF permission classes
* Ownership & role checks enforced server-side

---

## 🔩 5) Backend Runtime (entrypoint.sh)

On container start:

1.  Waits for PostgreSQL
2.  Runs migrations (configurable)
3.  Optional one-time bootstrap tasks:

   * Import MealDB data
   * Tokenize ingredients
   * Generate embeddings
4.  Starts Django server

---

## 🔐 6) Environment Variables (Minimum)

### Backend

* `SECRET_KEY`
* `DEBUG`
* `ALLOWED_HOSTS`

### Database

* `DB_HOST`
* `DB_PORT`
* `DB_NAME`
* `DB_USER`
* `DB_PASSWORD`

### Redis / Celery

* `REDIS_URL`

### AI (Optional)

* `OPENAI_API_KEY`

---

## 🧪 7) Local Development

### 🐍 Backend

```bash
cd GreenBite-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### ⚛️ Frontend

```bash
cd GreenBite-frontend
npm install
npm run dev
```

---

## 🐳 8) Docker Usage

```bash
docker compose up --build
```

* 🔙 Backend: [http://localhost:8000](http://localhost:8000)
* 🎨 Frontend: [http://localhost:5173](http://localhost:5173)

---

## 🧠 9) Core Backend Domains

*  **accounts** – Authentication & users
*  **food** – Food logging & waste tracking
*  **recipes** – Recipe features
*  **meal_plans** – Meal planning logic
*  **community** – Marketplace (Phase 1)
*  **subscriptions** – Seller eligibility
*  **payments** – Payment workflows

---
## Running tests

- Backend tests: run `python manage.py test` inside `GreenBite-backend` (ensure dependencies and DB are available).
- Frontend tests: (not included by default) follow typical React testing setup and scripts in `GreenBite-frontend/package.json`.

## Where to get help

- Open an issue in this repository for bugs or feature requests.
- Pull requests are welcome — please describe the change and include tests where appropriate.

For component-level details, check the component READMEs listed above.


