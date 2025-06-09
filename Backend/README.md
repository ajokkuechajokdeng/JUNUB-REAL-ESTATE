# Real Estate Django Backend

This project provides a Django backend for a real estate frontend. All important data such as houses and related entities are provided via API endpoints using Django REST Framework.

## Features
- API endpoints for houses (CRUD)
- Django admin for managing data
- Easily extendable for more real estate entities

## Setup
1. Install dependencies:
   ```bash
   pip install django djangorestframework
   ```
2. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
3. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```
4. Start the development server:
   ```bash
   python manage.py runserver
   ```

## API Endpoints
- `/api/houses/` - List, create, retrieve, update, and delete houses

## Admin
- Visit `/admin/` to manage data via the Django admin interface.

## Extending
- Add more models, serializers, and viewsets in the `realestate` app as needed.
