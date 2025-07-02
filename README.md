# JUNUB Real Estate

## Description

JUNUB Real Estate is a full-stack web application for managing and listing real estate properties in South Sudan. The backend is built with Django and Django REST Framework, providing robust API endpoints for CRUD operations. The frontend is a React application styled with Tailwind CSS and supports internationalization (i18n).

The platform supports multiple user roles including tenants and real estate agents. Agents can create profiles, upload and manage their property listings, while tenants can browse properties and save favorites.

---

## Table of Contents

- [GitHub Repository](#github-repository)
- [Figma Design](#figma-design)
- [Demo Video](#demo-video)
- [Database Schema](#database-schema)
- [How to Set Up the Environment and Project](#how-to-set-up-the-environment-and-project)
  - [Backend (Django)](#backend-django)
  - [Frontend (React)](#frontend-react)
- [Designs](#designs)
- [Deployment Plan](#deployment-plan)
- [Notes](#notes)
- [User Registration and Login](#user-registration-and-login)
  - [User Registration](#user-registration)
  - [Role-Based Login](#role-based-login)

---

## GitHub Repository

[ajokkuechajokdeng/JUNUB-REAL-ESTATE](https://github.com/ajokkuechajokdeng/JUNUB-REAL-ESTATE.git)

---

## Figma Design

You can view the UI/UX design prototype on Figma:
[View JUNUB REAL ESTATE on Figma](https://www.figma.com/design/Vx4Vy7ZaK3JQ63eSZtiaFt/JUNUB-REAL-ESTATE..?node-id=0-1&t=xZecZrEgNEpufP3B-1)

---

## Demo Video

Watch a video demonstration of the app here:
[App Demo Video](https://drive.google.com/file/d/1BzOIYgXcOFGhmK4W23-hEkJyGSghgmmW/view?usp=sharing)

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

- API Endpoints:
  - Authentication:
    - `/api/users/register/` - Register a new user (tenant or agent)
    - `/api/users/token/` - General JWT token endpoint with automatic role detection
    - `/api/users/tenant/login/` - Tenant-specific login endpoint (for backward compatibility)
    - `/api/users/agent/login/` - Agent-specific login endpoint (for backward compatibility)
    - `/api/users/token/refresh/` - Refresh JWT token
    - `/api/users/me/` - Get current user information
    - `/api/users/update_profile/` - Update user profile

  - Properties (Tenant & Agent access varies):
    - `/api/properties/listings/` - View properties (all users), Create/Update/Delete (agents only)
    - `/api/properties/listings/my_properties/` - Get properties created by the current user
    - `/api/properties/listings/agent_properties/` - Get properties associated with the current user as an agent (agents only)
    - `/api/properties/images/` - View images (all users), Create/Update/Delete (agents only)
    - `/api/properties/types/` - View property types (all users), Create/Update/Delete (agents only)
    - `/api/properties/features/` - View property features (all users), Create/Update/Delete (agents only)

  - Agent Profiles:
    - `/api/properties/agents/` - View agent profiles (all users), Create/Update/Delete (agents only)
    - `/api/properties/agents/my_profile/` - Get the agent profile of the current user (agents only)
    - `/api/properties/agents/{id}/agent_properties/` - Get properties associated with a specific agent (all users)

  - Tenant Features:
    - `/api/properties/favorites/` - Manage favorite properties (tenants only)
    - `/api/properties/favorites/recommended/` - Get recommended properties based on favorites (tenants only)
    - `/api/properties/inquiries/` - Create property inquiries (tenants only), View/Update/Delete own inquiries (tenants only)

  - Agent Features:
    - `/api/properties/inquiries/` - View inquiries about own properties (agents only)
    - `/api/properties/inquiries/{id}/respond/` - Respond to inquiries (agents only)
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

## Frontend Features

The JUNUB Real Estate frontend is built with React and includes the following professional features:

### Responsive Design
- Mobile-first approach with responsive layouts for all screen sizes
- Collapsible navigation menu for mobile devices
- Responsive grid layouts for property listings
- Optimized images and components for different screen sizes

### User Experience
- Automatic role detection during login
- Simplified login process with no need to select a role
- Intuitive navigation with clear user flows
- Loading states and spinners for asynchronous operations
- Comprehensive error handling and user-friendly error messages
- Form validation for all input fields

### Authentication and Security
- JWT-based authentication with secure token storage
- Automatic token refresh to prevent session expiration
- Role-based access control for tenant and agent features
- Protected routes for authenticated users

### Internationalization
- Multi-language support using i18next
- Language detection based on browser settings
- Translations for all UI elements and messages

### Voice Interface
- Voice commands using Alan AI
- Natural language processing for property search
- Voice-guided navigation through the application

---

## User Registration and Login

JUNUB Real Estate provides a role-based authentication system that allows users to register and login as either tenants or agents:

### User Registration

- Users can register through the `/api/users/register/` endpoint
- During registration, users must select a role (tenant or agent) using the `role` field
- Required fields for registration:
  - email
  - password
  - password2 (confirmation)
  - role (tenant or agent)
- Optional fields:
  - username (defaults to email if not provided)
  - first_name
  - last_name
  - phone_number
  - address
  - bio
  - profile_image

Example registration request for a tenant:
```json
{
  "email": "tenant@example.com",
  "password": "securepassword",
  "password2": "securepassword",
  "role": "tenant",
  "first_name": "John",
  "last_name": "Doe"
}
```

Example registration request for an agent:
```json
{
  "email": "agent@example.com",
  "password": "securepassword",
  "password2": "securepassword",
  "role": "agent",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone_number": "1234567890",
  "company": "ABC Realty"
}
```

When a user registers with the 'agent' role, an Agent profile is automatically created for them.

### Automatic Role Detection Login

- Users can log in using the `/api/users/token/` endpoint
- The system automatically detects the user's role based on their profile
- The role is included in the token data, allowing the frontend to provide role-specific features
- Role-specific endpoints (`/api/users/tenant/login/` and `/api/users/agent/login/`) are still available for backward compatibility

Example login request:
```json
{
  "username": "user@example.com",
  "password": "securepassword"
}
```

The login response includes the user's role in the token data, which the frontend uses to determine which features to display:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "role": "tenant"  // or "agent"
}
```

---

## Role-Based Functionality

JUNUB Real Estate provides distinct features for different user roles, ensuring a professional experience tailored to each user type:

### Tenant Features

- **Property Search and Filtering**
  - Advanced search capabilities with multiple filters
  - Filter by property type, price range, bedrooms, bathrooms, location, and more
  - Sort results by price, date added, and other criteria
  - Mobile-responsive design for searching on any device

- **Favorites System**
  - Save properties to a personal favorites list for easy access
  - View all favorited properties in one place
  - Remove properties from favorites with a single click
  - Dedicated "My Favorites" tab in the tenant dashboard
  - Receive personalized property recommendations based on favorites
  - Access the recommended properties via the `/api/properties/favorites/recommended/` endpoint

- **Property Inquiries**
  - Send inquiries directly to agents about properties of interest
  - Create inquiries from property details page or from favorites
  - Track the status of inquiries (pending, responded, closed) with visual indicators
  - View agent responses to inquiries in a threaded conversation format
  - Manage all inquiries in one place via the "My Inquiries" tab
  - Access inquiry data programmatically via the `/api/properties/inquiries/` endpoint

- **Tenant Dashboard**
  - Dedicated dashboard showing favorites and inquiries
  - Tab-based interface for easy navigation between different sections
  - Quick access to property details from both favorites and inquiries
  - Visual status indicators for inquiry responses
  - One-click access to contact agents about favorite properties

### Agent Features

- **Agent Registration and Profiles**
  - Users can register as agents by selecting the 'agent' role during registration
  - Agent profiles include comprehensive professional details such as:
    - Name and contact information
    - Professional bio and profile image
    - Company affiliation and branding
    - License number and verification status
    - Years of experience and specialization areas
    - Property portfolio statistics
  - Agent profiles are automatically created when a user registers with the 'agent' role
  - Agents can view and update their profile via the `/api/properties/agents/my_profile/` endpoint
  - Public agent profiles showcase the agent's properties and expertise

- **Property Management**
  - Comprehensive property creation and editing interface
  - Rich text description editor with formatting options
  - Multiple image upload with drag-and-drop functionality
  - Detailed property specifications including features and amenities
  - Properties created by agents are automatically associated with their agent profile
  - Agents can view all properties associated with their profile via the `/api/properties/listings/agent_properties/` endpoint
  - Public users can view properties by a specific agent via the `/api/properties/agents/{id}/agent_properties/` endpoint
  - Property status tracking (active, pending, sold, etc.)

- **Inquiry Management**
  - Agents receive inquiries from tenants about their properties
  - Notification system for new inquiries
  - Respond to inquiries directly through the platform
  - Track inquiry status and history with timestamps
  - Filter inquiries by property, status, or date
  - Access all inquiries via the `/api/properties/inquiries/` endpoint
  - Respond to specific inquiries via the `/api/properties/inquiries/{id}/respond/` endpoint
  - Analytics on inquiry response time and conversion rates

- **Image Management**
  - Agents can add multiple high-quality images to their property listings
  - Image gallery with thumbnail previews
  - Set featured/primary images for property listings
  - Only the property creator or the associated agent can add images to a property
  - Images are stored as URLs, allowing for integration with cloud storage services
  - The system validates permissions before allowing image uploads
  - Support for image captions and ordering

### Professional Features

- **Enhanced Role-Based Access Control**
  - Automatic role detection during login
  - No need for users to select their role when logging in
  - Custom permission classes ensure users can only access appropriate features
  - Tenant-specific endpoints are protected from unauthorized access
  - Agent-specific endpoints verify agent status before allowing operations
  - Object-level permissions ensure users can only modify their own data
  - Comprehensive validation during authentication and authorization

- **Comprehensive Admin Interface**
  - Detailed property and agent management
  - Inquiry tracking and management
  - User role management
  - Organized fieldsets for better data presentation

- **Robust Error Handling and Logging**
  - Detailed error messages for developers
  - User-friendly error responses
  - Comprehensive logging throughout the application
  - Graceful handling of edge cases

- **Well-Documented API**
  - Clear documentation for all endpoints
  - Detailed model relationships
  - Consistent response formats
  - Helpful error messages

- **Advanced Filtering and Search**
  - Multiple filter options for properties
  - Role-specific data filtering
  - Sorting capabilities
  - Search across multiple fields

---
