🎬 K-Drama Analytics & Prediction System

A comprehensive analytical and predictive system for Korean Dramas (K-Dramas). The application integrates Machine Learning (ML) technology to forecast user ratings, estimated viewership, and popularity levels of TV series based on their production and content features.

🚀 Key Features

🔮 AI-Powered Predictions: Forecasts drama ratings and popularity levels/ranks using trained machine learning models.

👥 Viewership Forecasting: Estimates the total expected audience reach (Watcher Count).

🔍 Smart Autocomplete: Provides real-time search suggestions and auto-fills detailed metadata for actors, directors, and screenwriters.

📊 Interactive Analytics Dashboard: Visualizes historical statistics on genres, broadcasting platforms, release trends, and key features impacting model predictions.

🔌 Standardized APIs: Features self-documenting endpoints integrated with Swagger/OpenAPI out of the box via FastAPI.

🗄️ Optimized Storage: Leverages PostgreSQL to store historical analytical records and personnel weighted score indices (Actor/Director/Writer performance scores).

🛠️ Tech Stack

Backend

Language: Python 3.11+

Web Framework: FastAPI & Uvicorn

ORM & Database: SQLAlchemy 2.x, PostgreSQL, psycopg2-binary

Data Science & ML: pandas, NumPy, scikit-learn, joblib

Data Validation: Pydantic v2

Frontend

Framework: Next.js (React & TypeScript)

Styling: Tailwind CSS & shadcn/ui

Data Visualization: Recharts

📂 Project Structure

.
├── KDrama/                         # Next.js Frontend
│   ├── app/                        # Next.js App Router
│   ├── components/                 # UI Components (shadcn/ui, charts, etc.)
│   ├── contexts/                   # State Management
│   ├── hooks/                      # Custom React Hooks
│   ├── lib/                        # Utility functions
│   └── package.json
│
└── kdrama-backend/                 # FastAPI Backend
    ├── app/
    │   ├── api/                    # API Routing and Controller Layer
    │   │   ├── dependencies.py     # Dependency Injection (DB sessions, etc.)
    │   │   └── routes/             # Route Definitions
    │   │       ├── health.py       # Health check endpoint
    │   │       ├── metadata.py     # Autocomplete metadata endpoints
    │   │       ├── prediction.py   # AI inference prediction endpoints
    │   │       └── stats.py        # Dashboard analytics statistics endpoints
    │   ├── core/                   # System Configurations
    │   │   ├── config.py           # Environment variables manager
    │   │   ├── database.py         # PostgreSQL connections (SQLAlchemy 2.x)
    │   │   └── ml.py               # Machine Learning artifact loader
    │   ├── services/               # Business Logic Layer
    │   │   ├── metadata_service.py
    │   │   ├── prediction_service.py
    │   │   └── stats_service.py
    │   ├── main.py                 # Core application entry point
    │   └── schemas.py              # Pydantic models for request/response validation
    ├── models/                     # Saved ML Model Artifacts (*.pkl)
    │   ├── encoding_maps.pkl
    │   ├── feature_lists.pkl
    │   ├── mlb_genres.pkl
    │   ├── models_ridge.pkl
    │   ├── tfidf_content.pkl
    │   └── tfidf_tag.pkl
    ├── .env.example
    ├── main.py                     # Legacy compatibility entry point
    ├── requirements.txt            # Python dependencies
    └── test_db.py                  # Script to verify database connectivity


⚙️ Setup & Installation

1. Backend Configuration (FastAPI)

Navigate to the backend directory:

cd /Users/khgngx/k-drama-dacn1/kdrama-backend


Create and activate a Python virtual environment:

python3 -m venv venv
source venv/bin/activate


Upgrade basic packaging tools and install the required dependencies:

python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt


Verify that your virtual environment is properly configured and all dependencies are loaded:

which python
python --version
python -m pip check
python -c "import fastapi, uvicorn, sqlalchemy, pandas, joblib, psycopg2, pydantic, sklearn; print('✅ All backend imports are verified!')"


💡 Note: Your virtual environment Python interpreter must point to: /Users/khgngx/k-drama-dacn1/kdrama-backend/venv/bin/python

Environment Variables

Create your environment configuration file from the template:

cp .env.example .env


Default variables inside .env:

APP_NAME=K-Drama Analytics API
APP_VERSION=1.0.0
CORS_ORIGINS=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=kdrama
DB_USER=postgres
DB_PASSWORD=123456

THRESHOLD_HOT=500
THRESHOLD_MEDIUM=1500


The system automatically parses these credentials into a standard postgresql+psycopg2 URI format to maintain compatibility with SQLAlchemy 2.x.

Database Setup (PostgreSQL)

Ensure PostgreSQL is running on your machine (e.g., using Homebrew on macOS):

brew services start postgresql


Verify database credentials and connectivity by running:

python test_db.py


⚠️ Requirement: The backend expects the database to contain the following tables:

public.dramas (Historical drama records)

scoring_data.actor_scores (Weighted index for actors)

scoring_data.director_scores (Weighted index for directors)

scoring_data.writer_scores (Weighted index for screenwriters)

Launch the Backend Server

Start the development server with hot-reload enabled:

python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000


API Root: http://127.0.0.1:8000/

Health Check: http://127.0.0.1:8000/health

Interactive Swagger Documentation: http://127.0.0.1:8000/docs

ReDoc Alternative Documentation: http://127.0.0.1:8000/redoc

2. Frontend Configuration (Next.js)

Open a new terminal window and navigate to the frontend directory:

cd /Users/khgngx/k-drama-dacn1/KDrama


Install the Node.js packages:

npm install


Run the development server:

npm run dev


Frontend Client URL: http://localhost:3000

The client communicates with the backend APIs at: http://localhost:8000

📡 API Usage Example (Prediction)

You can test the prediction endpoint using curl:

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

{
  "predicted_rating": 8.41,
  "predicted_watchers": 13581,
  "popularity_rank": 820,
  "popularity_level": "Medium"
}


🛠️ Troubleshooting

❌ VS Code Pylance Import Warnings

If VS Code shows red squiggly lines on your Python imports, ensure it is pointing to the correct Python virtual environment:

Open the Command Palette: Cmd + Shift + P (macOS) or Ctrl + Shift + P (Windows).

Search and select: Python: Select Interpreter.

Choose the project venv path: /Users/khgngx/k-drama-dacn1/kdrama-backend/venv/bin/python.

If issues persist, restart the language server: Python: Restart Language Server or run Developer: Reload Window.

❌ "psycopg2 is not defined" or Missing Modules

The system utilizes the pre-compiled psycopg2-binary driver to connect securely without compiling C code locally. Force-reinstall dependencies if errors persist:

python -m pip install -r requirements.txt --force-reinstall


❌ Custom Tokenizer Pickle Errors

The TF-IDF Vectorizer (tfidf_tag.pkl) was exported with a custom tokenizing function named my_tokenizer. The backend automatically registers and binds this dummy function in app/core/ml.py before unpickling. Do not remove or alter this registration block, otherwise Python's pickle library will raise an AttributeError.

⚠️ scikit-learn Version Warning

You may see a warning indicating that the model artifacts were trained on a different version of scikit-learn than the one installed. While this warning does not stop the backend server, it is highly recommended to run Python 3.11/3.12 alongside the exact scikit-learn version used during model compilation for maximum predictive consistency.

📝 Development Conventions

The root-level main.py is deliberately kept minimal to serve as a lightweight, quick-launch entry point.

The Application Factory logic and CORS middleware registrations are managed in app/main.py.

All business processes (Model inference, statistics aggregation, autocomplete query filters) are decoupled from API endpoints and managed within app/services/ to simplify Unit Testing and maximize maintainability.
