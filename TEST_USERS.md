# CureX40 Test Users

This document contains the test user credentials for all roles in the CureX40 system.

## Test User Credentials

All users have the password: `password`

### 1. Admin User
- **Email**: `admin@curex40.test`
- **Name**: System Admin
- **Role**: admin
- **Permissions**: All permissions (manage users, manage medications, manage pharmacies, view reports, place orders, upload prescriptions)

### 2. Patient User
- **Email**: `patient@curex40.test`
- **Name**: John Doe
- **Role**: patient
- **Permissions**: place orders, upload prescriptions

### 3. Pharmacist User
- **Email**: `pharmacist@curex40.test`
- **Name**: Dr. Sarah Johnson
- **Role**: pharmacist
- **Permissions**: manage medications, manage pharmacies, view reports

### 4. Government Official User
- **Email**: `government@curex40.test`
- **Name**: Michael Chen
- **Role**: government_official
- **Permissions**: (Default permissions for government role)

### 5. Insurance Provider User
- **Email**: `insurance@curex40.test`
- **Name**: Lisa Rodriguez
- **Role**: insurance_provider
- **Permissions**: (Default permissions for insurance role)

## Usage

1. Navigate to the login page
2. Use any of the email addresses above
3. Enter `password` as the password
4. You will be redirected to the appropriate dashboard based on the user's role

## Role-Based Dashboards

- **Admin**: Full system access
- **Patient**: Digital Vault, Orders, Prescriptions, Medications
- **Pharmacist**: Pharmacy Dashboard, Inventory Management
- **Government Official**: Government Dashboard, National Health Metrics
- **Insurance Provider**: Claims Dashboard, Insurance Management

## Notes

- All users are active and email verified
- Users are created using `firstOrCreate` so they won't be duplicated if the seeder is run multiple times
- Roles are assigned using Spatie Laravel Permission package
