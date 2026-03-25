# PhotoHub

> A full stack mobile photo app built from scratch — React Native frontend + Django REST API backend.
> Built as a learning journey, assisted by [Claude.ai](https://claude.ai) free plan.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| Camera | expo-camera |
| Gestures | react-native-gesture-handler + Reanimated |
| Backend | Django + Django REST Framework |
| Auth | JWT via djangorestframework-simplejwt |
| Database | PostgreSQL |
| Media | Pillow + Django media serving |

---

## Features

- **Register & Login** — email and password authentication with JWT tokens stored securely on device
- **Gallery Screen** — 3-column photo grid with fixed camera FAB
- **Camera Screen** — pinch-to-zoom, tap-to-focus, flash toggle, front/back flip
- **Photo Upload** — pick from library or shoot directly, add caption
- **Per-user Storage** — each user's photos isolated under `media/photos/user_<id>/`
- **PostgreSQL** — production-ready database with full relational support
- **Django Admin** — manage users and photos from the built-in dashboard

---

## Project Structure

```
photo-hub/
├── PhotoHub/               # React Native mobile app (Expo)
│   ├── app/
│   │   ├── _layout.tsx     # Root navigation layout
│   │   ├── index.tsx       # Entry point
│   │   ├── camera.tsx      # Camera screen
│   │   └── gallery.tsx     # Photo gallery screen
│   ├── client/             # API client with axios + JWT interceptor
│   ├── hooks/              # Custom React hooks
│   └── package.json
│
└── apis/                   # Django REST API backend
    ├── config/
    │   ├── settings.py
    │   └── urls.py
    ├── photos/             # Users + Photos app
    │   ├── models.py       # User and Photo models
    │   ├── serializers.py  # HyperlinkedModelSerializer
    │   ├── views.py        # ViewSets
    │   └── urls.py         # DefaultRouter
    ├── .env.example
    ├── manage.py
    └── requirements.txt
```

---

## Getting Started

### Backend — Django

```bash
# Clone the repo
git clone https://github.com/juliao-martins-dev/photo-hub.git
cd photo-hub/apis

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up PostgreSQL database
# Make sure PostgreSQL is running, then in psql:
# CREATE DATABASE photohub_db;
# CREATE USER your_user WITH PASSWORD 'your_password';
# GRANT ALL PRIVILEGES ON DATABASE photohub_db TO your_user;

# Set up environment variables
cp .env.example .env
# Edit .env with your SECRET_KEY and settings

# Run migrations
python manage.py migrate
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend running at `http://127.0.0.1:8000`
Django admin at `http://127.0.0.1:8000/admin`

---

### Frontend — React Native

```bash
cd photo-hub/PhotoHub

# Install dependencies
npm install

# Update API base URL in client/ to your local IP
# e.g. http://192.168.x.x:8000/api  (for real device on same WiFi)

# Start Expo
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `a` for Android / `i` for iOS simulator.

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/users/register/` | Create new account | Public |
| `POST` | `/api/users/login/` | Get JWT tokens | Public |
| `POST` | `/api/users/token/refresh/` | Refresh access token | Public |
| `GET` | `/api/users/me/` | Get current user | Required |
| `GET` | `/api/photos/` | List my photos | Required |
| `POST` | `/api/photos/` | Upload a photo | Required |
| `GET` | `/api/photos/{id}/` | Get photo detail | Required |
| `DELETE` | `/api/photos/{id}/` | Delete a photo | Required |

---

## Environment Variables

Create `apis/.env` from the provided `.env.example`:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://user:password@localhost:5432/photohub_db
```

---

## Learning Journey

This project was built step by step as a full stack learning exercise:

1. Django project setup with `django-environ` for secret management
2. Custom `User` model with email-based authentication
3. `Photo` model with per-user media storage
4. REST API with `HyperlinkedModelSerializer`, `ViewSets` and `DefaultRouter`
5. JWT authentication with `djangorestframework-simplejwt`
6. PostgreSQL database with `psycopg2-binary`
7. React Native project with Expo Router
8. `AuthContext` for global login state with `expo-secure-store`
9. Axios client with JWT interceptor
10. Gallery screen with `FlatList` 3-column grid
11. Camera screen with pinch-to-zoom via `react-native-gesture-handler` and `Reanimated`

> Every step of this project was assisted by **[Claude.ai](https://claude.ai)** free plan —
> from architecture decisions and code generation to commit messages and debugging.

---

## Git Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Meaning |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance, no behavior change |
| `refactor` | Code restructure, nothing broken |
| `docs` | Documentation only |

---

## Author

**Julião Martins** — [@juliao-martins-dev](https://github.com/juliao-martins-dev)

---

<p align="center">
  Built with React Native · Django · PostgreSQL · Claude.ai
</p>
