# Digital Subsidy Grant Platform

A full-stack government subsidy and grant disbursement tracking platform.

The project contains a Spring Boot REST API and a React + Vite frontend for managing subsidy schemes, beneficiaries, applications, verification, approvals, disbursements, users, roles, states, districts, and scheme coverage.

## Project Structure

```text
subsidy-backend/             Spring Boot API
subsidy-frontend-phase15/    React + Vite web application
.env.example                 Required backend environment variables
```

## Technology

- Java 25 LTS
- Spring Boot 3.2.12
- Maven Wrapper 3.9.16
- Spring Security with JWT authentication
- Spring Data JPA and Hibernate
- MySQL
- React 18
- Vite 5

## Configuration

The backend requires a MySQL database running on port `3306`.

Create the required environment variables before starting the backend:

```powershell
$env:DB_PASSWORD = "your-mysql-password"
$env:JWT_SECRET = "your-long-random-secret"
$env:ADMIN_PASSWORD = "your-admin-password"
```

The default database configuration is:

```text
Database: subsidy_disbursement
Username: root
Host: localhost
Port: 3306
```

Do not commit `.env` files or real credentials. Use [.env.example](.env.example) as a template.

## Run the Backend

Open PowerShell and run:

```powershell
Set-Location "subsidy-backend"

$env:JAVA_HOME = "C:\Users\saite\.jdk\jdk-25.0.2"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

.\mvnw.cmd spring-boot:run
```

The API runs at `http://localhost:8080`.

## Run the Frontend

Open a second PowerShell window:

```powershell
Set-Location "subsidy-frontend-phase15"
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Build and Test

Backend:

```powershell
Set-Location "subsidy-backend"
.\mvnw.cmd clean test
```

Frontend:

```powershell
Set-Location "subsidy-frontend-phase15"
npm run build
npm run lint
```

## Main API Areas

- Authentication and JWT login
- Role-based access control
- Subsidy scheme management
- Beneficiary registration and profile management
- Subsidy applications and eligibility evaluation
- Field verification
- Application approval and rejection
- Grant disbursement tracking
- User and role administration
- State, district, and scheme-district master data

## Current Status

Java 25 targeting is configured in the backend Maven project. Before a successful backend build, ensure the selected backend source tree contains all referenced application classes and that MySQL is available.

## Security Notes

- Backend secrets are supplied through environment variables.
- Passwords are handled by the backend and are never displayed in the frontend.
- Backend authorization remains the source of truth; frontend route guards provide user experience only.
- For production deployment, use HTTPS, rotate JWT secrets, use strong database credentials, and prefer secure httpOnly cookie-based authentication.
