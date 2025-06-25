# Project Structure

## Overview
This is a full-stack real estate application with Django backend and React frontend.

## Directory Structure

```
JUNUB REAL ESTATE/
├── Backend/                 # Django REST API
│   ├── ajok_backend/       # Django project settings
│   ├── realestate/         # Django app
│   ├── .env               # Environment variables
│   ├── db.sqlite3         # SQLite database
│   ├── manage.py          # Django management script
│   └── README.md          # Backend documentation
│
├── frontend/              # React application
│   ├── public/           # Static files
│   ├── src/              # React source code
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context
│   │   ├── hooks/        # Custom hooks (including Alan AI)
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── App.js        # Main app component
│   ├── package.json      # Frontend dependencies
│   ├── package-lock.json # Lock file
│   └── README-ALAN.md    # Alan AI setup guide
│
├── .gitignore            # Git ignore rules
└── README.md             # Main project documentation
```

## Running the Project

### Backend (Django)
```bash
cd Backend
python manage.py runserver
```

### Frontend (React)
```bash
cd frontend
npm start
```

