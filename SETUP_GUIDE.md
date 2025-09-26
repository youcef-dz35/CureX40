# CureX40 Platform Setup Guide

This guide will help you set up and link the CureX40 frontend (React/TypeScript) with the backend (Laravel) for local development and production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup (Laravel)](#backend-setup-laravel)
3. [Frontend Setup (React/TypeScript)](#frontend-setup-reacttypescript)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Linking Frontend and Backend](#linking-frontend-and-backend)
7. [Testing the Connection](#testing-the-connection)
8. [Development Workflow](#development-workflow)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have the following installed:

- **PHP 8.2 or higher**
- **Composer** (PHP dependency manager)
- **Node.js 18 or higher**
- **npm or yarn** (Node package manager)
- **MySQL 8.0** or **PostgreSQL 13+**
- **Redis** (for caching and queues)
- **Git**

### Optional but Recommended:
- **Docker** and **Docker Compose** (for containerized development)
- **Laravel Valet** or **Laravel Sail** (for local development environment)

## Backend Setup (Laravel)

### 1. Install PHP Dependencies

```bash
cd CureX40/backend
composer install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 3. Configure Environment Variables

Edit the `.env` file in the backend directory:

```env
# Application
APP_NAME="CureX40 Backend"
APP_ENV=local
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=curex40
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Mail Configuration (for development use Mailtrap or MailHog)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls

# Pusher Configuration (for real-time features)
PUSHER_APP_ID=your_pusher_app_id
PUSHER_APP_KEY=your_pusher_app_key
PUSHER_APP_SECRET=your_pusher_app_secret
PUSHER_APP_CLUSTER=mt1

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173

# Session Configuration
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_DOMAIN=localhost

# File Storage
FILESYSTEM_DRIVER=local

# Logging
LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug
```

### 4. Database Setup

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE curex40;"

# Run migrations
php artisan migrate

# Seed the database with sample data
php artisan db:seed
```

### 5. Storage and Cache Setup

```bash
# Create symbolic link for storage
php artisan storage:link

# Clear and cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Install passport or sanctum for API authentication
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 6. Start Laravel Development Server

```bash
# Start the Laravel development server
php artisan serve --host=0.0.0.0 --port=8000

# In another terminal, start the queue worker
php artisan queue:work

# In another terminal, start the scheduler (optional)
php artisan schedule:work
```

## Frontend Setup (React/TypeScript)

### 1. Install Node Dependencies

```bash
cd CureX40/frontend
npm install
```

### 2. Environment Configuration

Create environment files:

```bash
# Copy the example environment files
cp .env.example .env.local
cp .env.development .env.development.local
```

### 3. Configure Environment Variables

Edit `.env.local`:

```env
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_API_VERSION=v1

# App Configuration
VITE_APP_NAME=CureX40
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
VITE_APP_DEBUG=true

# Authentication
VITE_AUTH_TOKEN_STORAGE_KEY=curex40-token
VITE_AUTH_USER_STORAGE_KEY=curex40-user
VITE_AUTH_REFRESH_TOKEN_STORAGE_KEY=curex40-refresh-token

# Feature Flags
VITE_FEATURE_2FA_ENABLED=true
VITE_FEATURE_DARK_MODE=true
VITE_FEATURE_NOTIFICATIONS=true
VITE_FEATURE_IOT_INTEGRATION=true
VITE_FEATURE_AI_RECOMMENDATIONS=true

# External Services (use test/development keys)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
VITE_PUSHER_APP_KEY=your_pusher_app_key
VITE_PUSHER_APP_CLUSTER=mt1

# WebSocket Configuration
VITE_WS_URL=ws://localhost:8000

# Development Tools
VITE_REDUX_DEVTOOLS=true
VITE_MOCK_API=false
VITE_API_DELAY=0
```

### 4. Start Frontend Development Server

```bash
# Start the Vite development server
npm run dev

# The frontend should now be accessible at http://localhost:5173
```

## Linking Frontend and Backend

### 1. CORS Configuration (Backend)

The CORS configuration in `backend/config/cors.php` should already be set up correctly:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173'), 'http://localhost:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 2. Proxy Configuration (Frontend)

The Vite configuration in `frontend/vite.config.ts` includes proxy settings:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      ws: true,
    },
    '/sanctum': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### 3. API Service Layer

The frontend includes a comprehensive API service layer in `frontend/src/services/api/` that handles:

- Authentication and token management
- API requests with proper error handling
- Request/response interceptors
- Automatic token refresh
- Type-safe API calls

### 4. Authentication Flow

The authentication flow is handled by:

1. **Backend**: Laravel Sanctum for API token authentication
2. **Frontend**: AuthContext with automatic token refresh and storage

## Testing the Connection

### 1. Health Check

Test if the backend is running:

```bash
curl http://localhost:8000/api/v1/health
```

### 2. Test Registration

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### 3. Test Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

### 4. Frontend Connection Test

1. Open http://localhost:5173 in your browser
2. Try to register a new account
3. Try to log in
4. Check the browser's Network tab to see API requests

## Development Workflow

### 1. Running Both Servers

For development, you'll need to run both servers simultaneously:

**Terminal 1 - Backend:**
```bash
cd CureX40/backend
php artisan serve --host=0.0.0.0 --port=8000
```

**Terminal 2 - Queue Worker:**
```bash
cd CureX40/backend
php artisan queue:work
```

**Terminal 3 - Frontend:**
```bash
cd CureX40/frontend
npm run dev
```

### 2. Using Docker (Alternative)

Create a `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
    volumes:
      - ./backend:/var/www/html

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
    environment:
      - VITE_API_URL=http://localhost:8000

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: curex40
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

Then run:

```bash
docker-compose up -d
```

### 3. API Development Best Practices

1. **Use the API service layer** instead of direct fetch calls
2. **Handle errors properly** using the error handling utilities
3. **Implement loading states** for better UX
4. **Use TypeScript types** from the types definition file
5. **Test API endpoints** using tools like Postman or Insomnia

## Production Deployment

### 1. Backend Production Setup

```bash
# Install production dependencies
composer install --optimize-autoloader --no-dev

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Set up supervisor for queue workers
# Set up nginx/apache virtual host
# Configure SSL certificates
```

### 2. Frontend Production Build

```bash
# Create production build
npm run build

# The build files will be in the `dist` directory
# Deploy to your web server (nginx, apache, or CDN)
```

### 3. Environment Variables

Update production environment variables:

**Backend (.env):**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomainn.com

FRONTEND_URL=https://app.yourdomain.com

# Use production database
DB_HOST=your-production-db-host
DB_DATABASE=your-production-db

# Configure production mail
MAIL_MAILER=smtp
MAIL_HOST=your-production-mail-host

# Use production Redis
REDIS_HOST=your-production-redis-host
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_ENVIRONMENT=production
VITE_APP_DEBUG=false
```

## Troubleshooting

### Common Issues and Solutions

#### 1. CORS Errors

**Problem:** Browser shows CORS policy errors
**Solution:** 
- Verify `FRONTEND_URL` in backend `.env`
- Check `cors.php` configuration
- Ensure both servers are running

#### 2. Authentication Issues

**Problem:** Login fails or tokens not working
**Solution:**
- Check Sanctum configuration
- Verify API routes are protected correctly
- Clear Laravel cache: `php artisan cache:clear`

#### 3. Database Connection Issues

**Problem:** Database connection errors
**Solution:**
- Verify database credentials in `.env`
- Ensure database server is running
- Check if database exists

#### 4. API Not Found (404)

**Problem:** API endpoints return 404
**Solution:**
- Check if routes are defined in `api.php`
- Verify API prefix in frontend configuration
- Clear route cache: `php artisan route:clear`

#### 5. Hot Reload Not Working

**Problem:** Frontend changes not reflecting
**Solution:**
- Check if Vite dev server is running
- Verify proxy configuration
- Check for port conflicts

### Debugging Tools

1. **Laravel Telescope** - For backend debugging
2. **React DevTools** - For frontend component debugging
3. **Redux DevTools** - For state management debugging
4. **Browser Network Tab** - For API request debugging
5. **Laravel Log Viewer** - For backend error logs

### Getting Help

- Check the Laravel documentation: https://laravel.com/docs
- Check the React documentation: https://react.dev
- Check the Vite documentation: https://vitejs.dev
- Review API service code in `frontend/src/services/api/`
- Check backend controllers in `backend/app/Http/Controllers/Api/`

## Next Steps

After successfully setting up and linking the frontend and backend:

1. **Implement authentication pages** (login, register, forgot password)
2. **Create dashboard components** for different user roles
3. **Implement medication search and ordering**
4. **Add prescription management features**
5. **Set up real-time notifications**
6. **Implement IoT device integration**
7. **Add analytics and reporting features**

For specific implementation details, refer to the component examples and API service methods in the codebase.