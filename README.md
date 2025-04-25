# ⚙️ Async CSV Uploader – Django + React + Celery

This project is a full-stack solution for uploading and processing large CSV files asynchronously using Django REST Framework, Celery, React, and PostgreSQL — all containerized with Docker.

---

## 🚀 Features

- Upload large CSV files via a modern React + Tailwind UI
- Background processing with Celery (fast and non-blocking)
- REST API powered by Django
- PostgreSQL for persistent storage
- Redis as Celery broker
- Fully containerized with Docker & Docker Compose

---

## 🧱 Tech Stack

- **Frontend**: React, Axios, Tailwind CSS
- **Backend**: Django + Django REST Framework
- **Async Worker**: Celery
- **Broker**: Redis
- **Database**: PostgreSQL
- **Containerization**: Docker + Docker Compose

---

## 📁 Folder Structure

```
/District4k/dcelery/
│
├── app/                # Django project
│   ├── cworker/        # Celery app with models, tasks
│   ├── app/            # Django app with views, urls
│   ├── requirements/   # Requirements files for pip
│   ├── Dockerfile      # Backend Dockerfile
│   └── ...
│
├── my-frontend/        # React project
│   ├── src/
│   ├── Dockerfile      # Frontend Dockerfile
│   └── ...
│
├── docker-compose.yml
├── .env (optional)
├── command.me          # CLI command shortcuts or notes
└── ...
```

---

## ⚙️ Setup (Docker)

### 🐳 Run the Project

1. Clone the repository:

```bash
git clone https://github.com/yourusername/dcelery.git
cd District4k/dcelery
```

2. Start everything:

```bash
docker-compose up --build
```

3. Access the services local:

- React Frontend → [http://localhost:3001](http://localhost:3001)
- Django API → [http://localhost:8001](http://localhost:8001)
- PostgreSQL → available via `localhost:5432`
  
  Access the services in docker:
  
- React Frontend → [http://localhost:3000](http://localhost:3000)
- Django API → [http://localhost:8000](http://localhost:8000)
- PostgreSQL → available via `localhost:5432`
  

---

## 📤 Upload Flow

1. Use the React frontend to upload a CSV file.
2. Axios sends the file to the Django backend.
3. Django triggers a Celery task after saving the file.
4. Celery processes the CSV and inserts records into PostgreSQL.
5. Background processing keeps the web server responsive.

---

## 🔐 Environment Variables

You **do not need a separate `.env` file** — all environment variables can be **set or changed directly in `docker-compose.yml`** under the `environment:` section for each service.

#### Example (`docker-compose.yml`):

```yaml
services:
  db:
    image: postgres
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres

  backend:
    environment:
      - CELERY_BROKER=redis://redis:6379/0
```

You can customize:

- PostgreSQL database name, username, password
- Celery broker URL
- Django secret keys, debug flags, etc.

---

## ✅ Useful Commands

- Rebuild containers:  
  `docker-compose build`

- Restart everything:  
  `docker-compose up`

- Stop everything:  
  `docker-compose down`

- View Celery logs:  
  `docker-compose logs worker`

---

## 👨‍💻 Author

Built with resilience 💪  
GitHub: [District4k]  
Repo: [https://github.com/District4k/dcelery](https://github.com/District4k/dcelery)
