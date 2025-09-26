# CureX40 - Smart Pharmacy Platform

<div align="center">
  <img src="frontend/public/logo.png" alt="CureX40 Logo" width="200"/>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
  [![PHP Version](https://img.shields.io/badge/php-%3E%3D8.1-blue)](https://php.net/)
  [![Laravel](https://img.shields.io/badge/laravel-10.x-red)](https://laravel.com/)
  [![React](https://img.shields.io/badge/react-19.x-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)](https://www.typescriptlang.org/)
</div>

## 🏥 About CureX40

CureX40 is a next-generation digitized healthcare ecosystem that revolutionizes pharmacy operations through AI-powered medication management, IoT integration, and comprehensive automation. Our platform bridges the gap between patients, pharmacists, government regulators, and insurance providers.

### 🌟 Key Features

- **🤖 AI-Powered Health Assistant**: 24/7 intelligent medication management and health insights
- **🔒 Digital Health Vault**: Secure, encrypted storage for all health records and data
- **📱 Mobile-First Experience**: Complete pharmacy services accessible from any device
- **🏪 Smart Pharmacy Management**: IoT-enabled inventory and dispensing systems
- **🏛️ Government Dashboard**: Real-time health monitoring and regulatory oversight
- **💳 Insurance Integration**: Automated claims processing and fraud detection
- **🌐 Multi-Language Support**: Accessible healthcare for diverse communities

## 🏗️ Architecture

```
CureX40/
├── backend/          # Laravel API Backend
├── frontend/         # React TypeScript Frontend
├── docs/            # Documentation
└── infrastructure/   # DevOps & Deployment configs
```

### Technology Stack

#### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Animation**: Framer Motion

#### Backend
- **Framework**: Laravel 10
- **Database**: MySQL/PostgreSQL
- **Authentication**: Laravel Sanctum
- **API**: RESTful APIs
- **Queue**: Redis
- **File Storage**: AWS S3 compatible

#### DevOps
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: Laravel Telescope
- **Testing**: PHPUnit, Vitest

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **PHP** >= 8.1
- **Composer** >= 2.0
- **MySQL** >= 8.0 or **PostgreSQL** >= 13
- **Redis** (for queues and caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/curex40/platform.git
   cd CureX40
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Install dependencies
   composer install
   
   # Environment configuration
   cp .env.example .env
   php artisan key:generate
   
   # Database setup
   php artisan migrate
   php artisan db:seed
   
   # Start the server
   php artisan serve
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Environment configuration
   cp .env.example .env.local
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/api/documentation

## 📋 User Roles & Features

### 👤 Patients
- Medication management and reminders
- Digital prescription handling
- Health vault for medical records
- AI-powered health insights
- Pharmacy locator and ordering

### 💊 Pharmacists
- Smart inventory management
- Prescription verification and dispensing
- Patient consultation tools
- Analytics and reporting
- IoT device integration

### 🏛️ Government Officials
- National health monitoring dashboard
- Supply chain oversight
- Regulatory compliance tracking
- Public health analytics
- Emergency response coordination

### 💼 Insurance Providers
- Automated claims processing
- Fraud detection algorithms
- Coverage verification
- Cost analysis and reporting
- Provider network management

## 🛠️ Development

### Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API services
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── locales/       # Internationalization
├── public/            # Static assets
└── tests/            # Test files

backend/
├── app/
│   ├── Http/Controllers/  # API controllers
│   ├── Models/           # Eloquent models
│   ├── Services/         # Business logic
│   └── Middleware/       # HTTP middleware
├── database/
│   ├── migrations/       # Database migrations
│   └── seeders/         # Database seeders
├── routes/              # API routes
└── tests/              # Test files
```

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
npm test             # Run tests
```

#### Backend
```bash
php artisan serve    # Start development server
php artisan migrate  # Run database migrations
php artisan test     # Run tests
php artisan queue:work  # Process queue jobs
composer lint        # Run PHP CodeSniffer
composer fix         # Fix code style issues
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=CureX40
VITE_ENABLE_HTTPS=false
```

#### Backend (.env)
```env
APP_NAME=CureX40
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=curex40
DB_USERNAME=your_username
DB_PASSWORD=your_password

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

## 🧪 Testing

### Frontend Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Backend Testing
```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Run with coverage
php artisan test --coverage
```

## 🚢 Deployment

### Production Build

1. **Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Backend**
   ```bash
   cd backend
   composer install --no-dev --optimize-autoloader
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test` and `php artisan test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- **Frontend**: ESLint + Prettier configuration
- **Backend**: PSR-12 PHP coding standard
- **Commits**: Conventional Commits format

## 📚 Documentation

- [API Documentation](docs/api/README.md)
- [Frontend Components](docs/frontend/components.md)
- [Database Schema](docs/database/schema.md)
- [Deployment Guide](docs/deployment/README.md)
- [Security Guidelines](docs/security/README.md)

## 🔐 Security

CureX40 takes security seriously. We implement:

- **HIPAA Compliance**: Healthcare data protection standards
- **End-to-End Encryption**: All sensitive data encrypted
- **Role-Based Access Control**: Granular permission system
- **API Rate Limiting**: Protection against abuse
- **Security Headers**: OWASP recommended headers
- **Regular Security Audits**: Automated vulnerability scanning

If you discover a security vulnerability, please send an e-mail to security@curex40.com.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Q1 2024
- [ ] Advanced AI medication recommendations
- [ ] IoT sensor integration for smart shelves
- [ ] Mobile app for iOS/Android
- [ ] Telemedicine integration

### Q2 2024
- [ ] Blockchain prescription verification
- [ ] Multi-pharmacy network support
- [ ] Advanced analytics dashboard
- [ ] Third-party EHR integration

### Q3 2024
- [ ] International expansion support
- [ ] Voice-activated assistance
- [ ] Predictive health analytics
- [ ] Wearable device integration

## 🆘 Support

- **Documentation**: [docs.curex40.com](https://docs.curex40.com)
- **Community Forum**: [community.curex40.com](https://community.curex40.com)
- **Email Support**: support@curex40.com
- **Emergency Issues**: Call +1-800-CUREX40

## 👥 Team

- **Lead Developer**: [Your Name](https://github.com/username)
- **UI/UX Designer**: [Designer Name](https://github.com/designer)
- **Backend Architect**: [Backend Dev](https://github.com/backend)
- **DevOps Engineer**: [DevOps Name](https://github.com/devops)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape CureX40
- Healthcare professionals who provided domain expertise
- Open source libraries that power our platform
- Beta testers for their valuable feedback

---

<div align="center">
  <p>Built with ❤️ by the CureX40 Team</p>
  <p>Making healthcare accessible, intelligent, and secure for everyone.</p>
</div>