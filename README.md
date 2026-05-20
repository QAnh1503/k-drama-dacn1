```markdown
# 🎬 K-Drama Analytics & Prediction System

An enterprise-grade, full-stack analytical and predictive platform designed for Korean Dramas (K-Dramas). This application leverages machine learning pipelines to forecast user ratings, total viewership (watcher count), and popularity dynamics of TV series based on production variables, cast, and structural content features.

## 🚀 Key Features

*   **🔮 AI-Powered Predictions:** Forecasts drama ratings, popularity ranks, and categorized levels using trained Machine Learning models.
*   **👥 Viewership Forecasting:** Estimates the total expected target audience reach (Watcher Count).
*   **🔍 Smart Autocomplete:** Provides real-time query suggestions and automatically resolves metadata for actors, directors, and screenwriters.
*   **📊 Analytics Dashboard:** Renders interactive historical insights visualizing genres, networks, temporal release patterns, and key features impacting model behavior.
*   **🔌 Standardized APIs:** Features self-documenting OpenAPI endpoints generated dynamically via FastAPI.
*   **🗄️ Optimized Storage:** Integrates a PostgreSQL database storing historical metadata and personnel weighted score indices (Actor/Director/Writer performance scores).

---

## 🛠️ Tech Stack

### Backend
*   **Language:** Python 3.11+
*   **Web Framework:** FastAPI & Uvicorn (ASGI)
*   **ORM & Driver:** SQLAlchemy 2.x, PostgreSQL, psycopg2-binary
*   **Data Science & ML:** pandas, NumPy, scikit-learn, joblib
*   **Data Validation:** Pydantic v2

### Frontend
*   **Framework:** Next.js (React & TypeScript)
*   **Styling:** Tailwind CSS & shadcn/ui
*   **Data Visualization:** Recharts

---

## 📂 Project Structure

```text
.
├── KDrama/                         # Next.js Frontend
│   ├── app/                        # Next.js App Router
│   ├── components/                 # Core UI & Recharts components
│   ├── contexts/                   # Global React State Management
│   ├── hooks/                      # Custom React Hooks
│   ├── lib/                        # Client-side Utility functions
│   └── package.json
│
└── kdrama-backend/                 # FastAPI Backend
    ├── app/
    │   ├── api/                    # API Routing and Controller Layer
    │   │   ├── dependencies.py     # Dependency Injection (DB sessions, etc.)
    │   │   └── routes/             # Route Definitions
    │   │       ├── health.py       # Health checks
    │   │       ├── metadata.py     # Actor/Director/Writer autocomplete
    │   │       ├── prediction.py   # AI inference & prediction models
    │   │       └── stats.py        # Dashboard metrics & aggregations
    │   ├── core/                   # Infrastructure & Configuration
    │   │   ├── config.py           # Pydantic-based settings manager
    │   │   ├── database.py         # SQLAlchemy engine setup (v2.x)
    │   │   └── ml.py               # Serialized ML model loader
    │   ├── services/               # Decoupled Business Logic Layer
    │   │   ├── metadata_service.py
    │   │   ├── prediction_service.py
    │   │   └── stats_service.py
    │   ├── main.py                 # Core Application Factory setup
    │   └── schemas.py              # Pydantic schemas for request/response validation
    ├── models/                     # Serialized ML Artifacts (*.pkl)
    │   ├── encoding_maps.pkl
    │   ├── feature_lists.pkl
    │   ├── mlb_genres.pkl
    │   ├── models_ridge.pkl
    │   ├── tfidf_content.pkl
    │   └── tfidf_tag.pkl
    ├── .env.example
    ├── main.py                     # Thin entry point for dev launcher
    ├── requirements.txt            # Python dependencies
    └── test_db.py                  # Integration script to verify DB connectivity
⚙️ Setup & Installation
1. Backend Configuration (FastAPI)
Navigate to the backend directory:

Bash
cd /Users/khgngx/k-drama-dacn1/kdrama-backend
Create and activate a Python virtual environment:

Bash
python3 -m venv venv
source venv/bin/activate
Upgrade basic packaging tools and install the required dependencies:

Bash
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
Verify that your virtual environment is properly configured and all dependencies are loaded successfully:

Bash
which python
python --version
python -m pip check
python -c "import fastapi, uvicorn, sqlalchemy, pandas, joblib, psycopg2, pydantic, sklearn; print('✅ All backend imports are verified!')"
💡 Interpreter Note: Ensure your VS Code / IDE interpreter points specifically to: /Users/khgngx/k-drama-dacn1/kdrama-backend/venv/bin/python

Environment Variables
Create your local configuration file from the template:

Bash
cp .env.example .env
Review and adjust the default variables inside .env:

Code snippet
APP_NAME="K-Drama Analytics API"
APP_VERSION=1.0.0
CORS_ORIGINS=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=kdrama
DB_USER=postgres
DB_PASSWORD=123456

THRESHOLD_HOT=500
THRESHOLD_MEDIUM=1500
The backend automatically formats these variables into a compliant postgresql+psycopg2 URI pattern to guarantee driver compatibility with SQLAlchemy 2.x.

Database Setup (PostgreSQL)
Ensure PostgreSQL is running locally (e.g., using Homebrew on macOS):

Bash
brew services start postgresql
Verify database schemas and connections by executing:

Bash
python test_db.py
⚠️ Database Expectations: The application expects the following tables/schemas to exist in your database:

public.dramas (Historical database records)

scoring_data.actor_scores (Weighted performance indices for actors)

scoring_data.director_scores (Weighted performance indices for directors)

scoring_data.writer_scores (Weighted performance indices for writers)

Launch the Backend Server
Start the development server with hot-reload enabled:

Bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
API Root: http://127.0.0.1:8000/

Health Status: http://127.0.0.1:8000/health

Swagger API Docs: http://127.0.0.1:8000/docs

ReDoc API Docs: http://127.0.0.1:8000/redoc

2. Frontend Configuration (Next.js)
Open a new terminal session and navigate to the frontend directory:

Bash
cd /Users/khgngx/k-drama-dacn1/KDrama
Install the project dependencies:

Bash
npm install
Run the development server:

Bash
npm run dev
Frontend Client URL: http://localhost:3000

Note: The frontend is configured to consume APIs at http://localhost:8000 by default.

📡 API Usage Example (Prediction)
Test the ML prediction endpoint using curl:

Bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Moonlight Sonata",
    "main_lead1": "Kim Soo Hyun",
    "main_lead2": "Jun Ji Hyun",
    "directors": "Park Shin Woo",
    "screenwriters": "Park Ji Eun",
    "genres": "Romance, Drama",
    "tags": "Contract Relationship, Rich Male Lead, Emotional",
    "content": "A pianist loses his hearing and finds a new life through music and love.",
    "episodes": 16,
    "duration_mins": 70,
    "start_year": 2026,
    "start_month": 12,
    "age_rating": "15+"
  }'
Success Response (JSON):

JSON
{
  "predicted_rating": 8.41,
  "predicted_watchers": 13581,
  "popularity_rank": 820,
  "popularity_level": "Medium"
}
🛠️ Troubleshooting
❌ VS Code Pylance Import Warnings
If you notice red squiggly lines on your Python package imports:

Open the Command Palette: Cmd + Shift + P (macOS) or Ctrl + Shift + P (Windows).

Select: Python: Select Interpreter.

Choose the project's virtual environment: /Users/khgngx/k-drama-dacn1/kdrama-backend/venv/bin/python.

If the warning persists, reload the window via Developer: Reload Window or run Python: Restart Language Server.

❌ "psycopg2 is not defined" or Missing Module Drivers
The backend uses psycopg2-binary to bypass local compilation issues. Force-reinstall dependencies if drivers fail to load:

Bash
python -m pip install -r requirements.txt --force-reinstall
❌ Custom Tokenizer Pickle Errors
The TF-IDF Vectorizer (tfidf_tag.pkl) was serialized with a custom tokenizing function named my_tokenizer. The backend automatically registers and binds a dummy definition in app/core/ml.py prior to importing the models. Do not remove this registration block, otherwise Python's pickle library will raise an AttributeError.

⚠️ scikit-learn Version Warning
You might receive warnings stating that model artifacts were generated using a different version of scikit-learn than the one installed. While this does not prevent server initialization, it is highly recommended to run Python 3.11/3.12 matching the training dependencies for optimal inference consistency.

📝 Development Conventions
The root-level main.py is kept as a lightweight launcher to ensure cross-module compatibility.

CORS policies, App Lifecycle hooks, and Middleware declarations are registered dynamically in app/main.py.

All complex routines (inference calculations, analytical transformations, DB query builders) are strictly decoupled from routing endpoints and abstracted into app/services/ to facilitate unit testing.
