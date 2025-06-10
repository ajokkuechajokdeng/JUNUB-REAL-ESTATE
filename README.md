# JUNUB Real Estate

## Description
JUNUB Real Estate is a full-stack web application for managing and listing real estate properties in South Sudan. The backend is built with Django and Django REST Framework, providing robust API endpoints for CRUD operations. The frontend is a React application styled with Tailwind CSS and supports internationalization (i18n).

---

## Table of Contents
- [GitHub Repository](#github-repository)
- [Figma Design](#figma-design)
- [Database Schema](#database-schema)
- [How to Set Up the Environment and Project](#how-to-set-up-the-environment-and-project)
  - [Backend (Django)](#backend-django)
  - [Frontend (React)](#frontend-react)
- [Designs](#designs)
- [Deployment Plan](#deployment-plan)
- [Notes](#notes)

---

## GitHub Repository
[ajokkuechajokdeng/JUNUB-REAL-ESTATE](https://github.com/ajokkuechajokdeng/JUNUB-REAL-ESTATE.git)

---

## Figma Design
You can view the UI/UX design prototype on Figma:
[View JUNUB REAL ESTATE on Figma](https://www.figma.com/design/Vx4Vy7ZaK3JQ63eSZtiaFt/JUNUB-REAL-ESTATE..?node-id=0-1&t=xZecZrEgNEpufP3B-1)

---

## Database Schema
Below is the database schema for JUNUB Real Estate:
![Database Schema](./frontend/public/Images/Databases%20Schema.png)

---

## How to Set Up the Environment and Project

### Backend (Django)
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   pip install django djangorestframework
   ```
3. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
4. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```
5. Start the development server:
   ```bash
   python manage.py runserver
   ```
- API Endpoints: `/api/houses/` for house CRUD operations
- Admin: `/admin/` for Django admin interface

### Frontend (React)
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

---

## Designs
Below is a screenshot of the main interface of JUNUB Real Estate:

![JUNUB Real Estate Home](./frontend/public/Images/Screenshot%202025-06-09%20164400.png)

> _Find Your Dream Home in South Sudan_ — The homepage features a quick search for properties by location, type, status, and bedrooms, with a modern and user-friendly interface.

---

## Deployment Plan
1. **Backend**: Deploy the Django backend to a cloud provider (e.g., Heroku, AWS, DigitalOcean). Configure environment variables, allowed hosts, and use a production-ready database.
2. **Frontend**: Build the React app using `npm run build` and deploy the static files to a service like Vercel, Netlify, or serve them via Django.
3. **Domain & SSL**: Point your domain to the deployed services and set up SSL certificates.
4. **Environment Variables**: Set all sensitive keys and API URLs via environment variables in both frontend and backend.

---

## Notes
- To extend backend functionality, add models, serializers, and viewsets in the `realestate` app.
- The frontend supports multiple languages via the `public/locales` directory.

---
