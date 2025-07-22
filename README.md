# JUNUB Real Estate

## Overview

JUNUB Real Estate is a full-stack web application for managing and listing real estate properties in South Sudan. It supports tenants and agents, with features for property search, management, favorites, inquiries, and more.

---

## Demo & Deployed App

- **Deployed App:** [https://junub-real-estate.vercel.app/](https://junub-real-estate.vercel.app/)
- **Demo Video:** [App Demo Video (5 min)](https://docs.google.com/document/d/1GytT4VisoHvPAKEbAa4km7dwsET_FpvYbNLX1PYsPGM/edit?tab=t.0)



---


# JUNUB Real Estate

## Overview

JUNUB Real Estate is a full-stack web application for managing and listing real estate properties in South Sudan. It supports tenants and agents, with features for property search, management, favorites, inquiries, and more.

---

## Demo & Deployed App

- **Deployed App:** [https://junub-real-estate.vercel.app/](https://junub-real-estate.vercel.app/)
- **Demo Video:** [App Demo Video (5 min)](https://docs.google.com/document/d/1GytT4VisoHvPAKEbAa4km7dwsET_FpvYbNLX1PYsPGM/edit?tab=t.0)

---

## Visual Overview & Feature Highlights

### Database Schema
![Database Schema](frontend/public/Images/Databases%20Schema.png)

---


### Home Page
The main entry point for users, showing featured properties and search options. Users can also use voice commands to search for properties, thanks to Alan AI integration.
![Home Page](frontend/public/Images/Home%20page.png)

---

### Tenant Experience

#### Tenant Dashboard
Personalized dashboard for tenants to manage favorites, inquiries, and view recommended properties.
![Tenant Dashboard](frontend/public/Images/tenant%20dashboard.png)

#### Tenant Dashboard (Alternative View)
![Tenant Dashboard Alt](frontend/public/Images/Tenant.%20dashboard.png)


#### Tenant Inquiries
Tenants can message or make inquiries about a property directly to the agent, and manage their sent messages.
![Tenant Inquiries](frontend/public/Images/inquire%20or%20message%20agent.png)

---

### Agent Experience

#### Agent Dashboard
Agents can manage their property listings and view analytics.
![Agent Dashboard](frontend/public/Images/Agent%20dashboard.png)


#### Agent Properties
Agents can manage their properties, including creating, editing, and removing listings.
![Agent Properties](frontend/public/Images/Agnet%20properties.png)

#### Agent Inquiries
Agents can view and respond to inquiries from potential tenants.
![Agent Inquiries](frontend/public/Images/Agent%20inquiries.png)
![Agent Inquiries Alt](frontend/public/Images/Agent%20inquires.png)

---

## Project Setup

### 1. Clone the Repository

Start by cloning the repository to your local machine:

```bash
git clone https://github.com/ajokkuechajokdeng/JUNUB-REAL-ESTATE.git
cd JUNUB-REAL-ESTATE
```

### 2. Backend (Django)

1. **Navigate to Backend:**
   ```bash
   cd Backend
   ```
2. **Set up environment variables:**
   - Create a `.env` file in the `Backend` directory.
   - Add your secret keys and database configuration, for example:
     ```
     SECRET_KEY=your-django-secret-key
     DEBUG=True
     DB_NAME=your_db_name
     DB_USER=your_db_user
     DB_PASSWORD=your_db_password
     DB_HOST=localhost
     DB_PORT=5432
     ```
   - Make sure your database (e.g., MySQL) is running and matches your `.env` configuration.
3. **Install dependencies:**
   ```bash
   pip install django djangorestframework python-dotenv
   ```
4. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. **Create a superuser:**
   ```bash
   python manage.py createsuperuser
   ```
6. **Start the server:**
   ```bash
   python manage.py runserver
   ```

### 3. Frontend (React)

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm start
   ```

---

## Core Features

- **Role-based authentication:** Tenants and agents with automatic role detection.
- **Property management:** Agents can create, edit, and manage listings.
- **Property search & filtering:** Advanced filters for tenants.
- **Favorites system:** Tenants can save and manage favorite properties.
- **Inquiries:** Tenants can contact agents; agents can respond.
- **Agent profiles:** Professional details, company, bio, and more.
- **Internationalization:** Multi-language support.
- **Voice commands:** Alan AI integration for navigation and search.
- **Responsive design:** Mobile-first, optimized for all devices.

---

## API Endpoints (Summary)

- **Authentication:** `/api/users/register/`, `/api/users/token/`, `/api/users/me/`, etc.
- **Properties:** `/api/properties/listings/`, `/api/properties/types/`, `/api/properties/features/`
- **Favorites & Recommendations:** `/api/properties/favorites/`, `/api/properties/favorites/recommended/`
- **Inquiries:** `/api/properties/inquiries/`, `/api/properties/inquiries/{id}/respond/`
- **Agent Profiles:** `/api/properties/agents/`, `/api/properties/agents/my_profile/`

---

## Project Links

- **GitHub Repository:** [ajokkuechajokdeng/JUNUB-REAL-ESTATE](https://github.com/ajokkuechajokdeng/JUNUB-REAL-ESTATE.git)
- **Figma Design:** [View on Figma](https://www.figma.com/design/Vx4Vy7ZaK3JQ63eSZtiaFt/JUNUB-REAL-ESTATE..?node-id=0-1&t=xZecZrEgNEpufP3B-1)

---

## Notes

- To extend backend functionality, add models, serializers, and viewsets in the `realestate` app.
- The frontend supports multiple languages via the `public/locales` directory.

---

## Additional Information

See below for detailed features, role-based functionality, and API documentation.

<details>
<summary>Click to expand for more details</summary>

### User Registration and Login

- Register via `/api/users/register/` with role selection (`tenant` or `agent`).
- Login via `/api/users/token/` (automatic role detection).
- Example registration and login requests are provided in the full documentation.

### Role-Based Functionality

#### Tenant Features

- Property search, filtering, favorites, inquiries, dashboard, recommendations.

#### Agent Features

- Agent profile, property management, inquiry management, image management.

#### Professional Features

- Enhanced role-based access control, admin interface, error handling, logging, API documentation, advanced filtering.